import { randomBytes } from "node:crypto";
import { CouponType, OrderStatus, PaymentMethod, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { paymentProviderFor } from "@/lib/integrations/payment";
import { calculateCartTotals, type CartWithItems } from "@/modules/cart/cart.service";
import { fulfillReservedInventory, releaseReservedInventory, reserveInventory } from "@/modules/inventory/inventory.service";

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["RETURNED"],
  CANCELLED: [],
  RETURNED: [],
};

type CheckoutInput = {
  recipient: string;
  phone: string;
  email?: string;
  division?: string;
  district: string;
  area: string;
  addressLine1: string;
  addressLine2?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
};

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `SR-${date}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

async function resolveDelivery(tx: Prisma.TransactionClient, district: string, subtotal: number) {
  const normalizedDistrict = district.trim();
  const zone =
    (await tx.deliveryZone.findFirst({ where: { district: { equals: normalizedDistrict, mode: "insensitive" }, isActive: true } })) ??
    (await tx.deliveryZone.findFirst({
      where: { type: normalizedDistrict.toLowerCase() === "dhaka" ? "DHAKA" : "OUTSIDE_DHAKA", district: null, isActive: true },
    }));

  if (!zone) throw new Error("Delivery is not configured for this address yet.");
  return { zone, deliveryFee: zone.freeShippingOver && subtotal >= zone.freeShippingOver ? 0 : zone.baseFee };
}

async function calculateCouponDiscount(
  tx: Prisma.TransactionClient,
  cart: CartWithItems,
  subtotal: number,
  couponCode?: string,
  userId?: string,
) {
  if (!couponCode) return { coupon: null, discount: 0 };
  const coupon = await tx.coupon.findUnique({
    where: { code: couponCode.toUpperCase() },
    include: { productLinks: true, categoryLinks: true, _count: { select: { redemptions: true } } },
  });
  const now = new Date();
  if (!coupon || !coupon.isActive || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
    throw new Error("This coupon is invalid or expired.");
  }
  if (coupon.minimumOrder && subtotal < coupon.minimumOrder) throw new Error("Your order does not meet this coupon's minimum value.");
  if (coupon.usageLimit && coupon._count.redemptions >= coupon.usageLimit) throw new Error("This coupon has reached its usage limit.");
  if (userId && coupon.perUserLimit) {
    const usedByCustomer = await tx.couponRedemption.count({ where: { couponId: coupon.id, userId } });
    if (usedByCustomer >= coupon.perUserLimit) throw new Error("You have already used this coupon the allowed number of times.");
  }

  const scopedProductIds = new Set(coupon.productLinks.map((link) => link.productId));
  const scopedCategoryIds = new Set(coupon.categoryLinks.map((link) => link.categoryId));
  const isScoped = scopedProductIds.size > 0 || scopedCategoryIds.size > 0;
  const eligibleSubtotal = cart.items.reduce((total, item) => {
    const isEligible = !isScoped || scopedProductIds.has(item.productId) || scopedCategoryIds.has(item.product.categoryId);
    return isEligible ? total + item.variant.price * item.quantity : total;
  }, 0);
  if (isScoped && eligibleSubtotal === 0) throw new Error("This coupon does not apply to items in your cart.");

  let discount = coupon.type === CouponType.PERCENTAGE ? Math.floor((eligibleSubtotal * coupon.value) / 100) : coupon.value;
  if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  return { coupon, discount: Math.min(discount, eligibleSubtotal) };
}

export async function quoteCheckout(cart: CartWithItems, district: string, couponCode?: string, userId?: string) {
  if (cart.items.length === 0) throw new Error("Your bag is empty.");
  const { subtotal } = calculateCartTotals(cart);

  return db.$transaction(async (tx) => {
    const { zone, deliveryFee } = await resolveDelivery(tx, district, subtotal);
    const { coupon, discount } = await calculateCouponDiscount(tx, cart, subtotal, couponCode ?? cart.couponCode ?? undefined, userId);
    return { subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee, zone, couponCode: coupon?.code ?? null };
  });
}

export async function createOrderFromCart(input: {
  cartId: string;
  userId?: string;
  checkout: CheckoutInput;
}) {
  const order = await db.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { id: input.cartId },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
            variant: { include: { inventory: true } },
          },
        },
      },
    });
    if (!cart || cart.status !== "ACTIVE" || cart.items.length === 0) throw new Error("Your bag is empty or has already been checked out.");

    for (const item of cart.items) {
      if (!item.variant.isActive || item.product.status !== "ACTIVE" || !item.variant.inventory) {
        throw new Error("One or more items in your bag are unavailable.");
      }
    }

    const typedCart = cart as CartWithItems;
    const { subtotal } = calculateCartTotals(typedCart);
    const { zone, deliveryFee } = await resolveDelivery(tx, input.checkout.district, subtotal);
    if (input.checkout.paymentMethod === "COD" && !zone.isCodEnabled) throw new Error("Cash on delivery is unavailable for this area.");

    const { coupon, discount } = await calculateCouponDiscount(
      tx,
      typedCart,
      subtotal,
      input.checkout.couponCode || cart.couponCode || undefined,
      input.userId,
    );
    const orderNumber = createOrderNumber();
    const total = subtotal - discount + deliveryFee;

    const order = await tx.order.create({
      data: {
        number: orderNumber,
        userId: input.userId,
        email: input.checkout.email || null,
        recipient: input.checkout.recipient,
        phone: input.checkout.phone,
        division: input.checkout.division || null,
        district: input.checkout.district,
        area: input.checkout.area,
        addressLine1: input.checkout.addressLine1,
        addressLine2: input.checkout.addressLine2 || null,
        paymentMethod: input.checkout.paymentMethod,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode: coupon?.code || null,
        notes: input.checkout.notes || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.product.name,
            productSlug: item.product.slug,
            imageUrl: item.product.images[0]?.url,
            sku: item.variant.sku,
            color: item.variant.color,
            size: item.variant.size,
            unitPrice: item.variant.price,
            quantity: item.quantity,
            lineTotal: item.variant.price * item.quantity,
          })),
        },
        statusHistory: { create: { toStatus: "PENDING", note: "Order placed" } },
      },
    });

    for (const item of cart.items) {
      await reserveInventory(tx, item.variantId, item.quantity, order.id);
    }

    if (coupon) {
      await tx.couponRedemption.create({ data: { couponId: coupon.id, userId: input.userId, orderId: order.id } });
    }

    const provider = paymentProviderFor(input.checkout.paymentMethod);
    const payment = await provider.startPayment({
      orderNumber: order.number,
      amount: total,
      customerName: input.checkout.recipient,
      customerPhone: input.checkout.phone,
    });
    await tx.paymentAttempt.create({
      data: {
        orderId: order.id,
        provider: payment.provider,
        providerRef: payment.providerReference,
        amount: total,
        idempotencyKey: randomBytes(20).toString("hex"),
      },
    });

    await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED" } });
    await tx.outboxEvent.create({ data: { type: "order.created", payload: { orderId: order.id, orderNumber: order.number } } });

    return order;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return order;
}

export async function changeOrderStatus(input: {
  orderId: string;
  toStatus: OrderStatus;
  changedById: string;
  note?: string;
}) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ include: { items: true }, where: { id: input.orderId } });
    if (!order) throw new Error("Order not found.");
    if (!orderTransitions[order.status].includes(input.toStatus)) throw new Error("This order status change is not allowed.");

    if (input.toStatus === "CANCELLED") {
      for (const item of order.items) {
        if (item.variantId) await releaseReservedInventory(tx, item.variantId, item.quantity, order.id);
      }
    }
    if (input.toStatus === "DELIVERED") {
      for (const item of order.items) {
        if (item.variantId) await fulfillReservedInventory(tx, item.variantId, item.quantity);
      }
    }
    if (input.toStatus === "RETURNED") {
      for (const item of order.items) {
        if (!item.variantId) continue;
        const inventory = await tx.inventoryItem.update({ where: { variantId: item.variantId }, data: { onHand: { increment: item.quantity } } });
        await tx.inventoryAdjustment.create({ data: { inventoryItemId: inventory.id, quantityDelta: item.quantity, reason: "RETURNED", orderId: order.id } });
      }
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: input.toStatus,
        statusHistory: { create: { fromStatus: order.status, toStatus: input.toStatus, note: input.note, changedById: input.changedById } },
      },
    });
  });
}
