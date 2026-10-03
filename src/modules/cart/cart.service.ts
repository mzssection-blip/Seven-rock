import { CartStatus, Prisma, ProductStatus } from "@prisma/client";
import { db } from "@/lib/db";

const cartInclude = {
  items: {
    include: {
      product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } },
      variant: { include: { inventory: true } },
    },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

export async function getOrCreateCart(identity: { userId?: string; guestToken?: string }) {
  if (!identity.userId && !identity.guestToken) throw new Error("Cart identity is required.");

  const existing = identity.userId
    ? await db.cart.findFirst({ where: { userId: identity.userId, status: CartStatus.ACTIVE }, include: cartInclude })
    : await db.cart.findUnique({ where: { guestToken: identity.guestToken }, include: cartInclude });

  if (existing) return existing;

  return db.cart.create({
    data: { userId: identity.userId, guestToken: identity.guestToken },
    include: cartInclude,
  });
}

export async function getCart(identity: { userId?: string; guestToken?: string }) {
  if (identity.userId) {
    return db.cart.findFirst({ where: { userId: identity.userId, status: CartStatus.ACTIVE }, include: cartInclude });
  }
  if (identity.guestToken) return db.cart.findUnique({ where: { guestToken: identity.guestToken }, include: cartInclude });
  return null;
}

export async function addCartItem(cartId: string, productId: string, variantId: string, quantity: number) {
  const variant = await db.productVariant.findFirst({
    where: { id: variantId, productId, isActive: true, product: { status: ProductStatus.ACTIVE } },
    include: { inventory: true },
  });
  if (!variant?.inventory || variant.inventory.onHand - variant.inventory.reserved < quantity) {
    throw new Error("This variant is out of stock.");
  }

  return db.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    create: { cartId, productId, variantId, quantity },
    update: { quantity: { increment: quantity } },
  });
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) return db.cartItem.delete({ where: { id: cartItemId } });
  return db.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
}

export async function mergeGuestCartIntoUser(userId: string, guestToken?: string) {
  if (!guestToken) return;

  await db.$transaction(async (tx) => {
    const guestCart = await tx.cart.findUnique({ where: { guestToken }, include: { items: true } });
    if (!guestCart || guestCart.status !== CartStatus.ACTIVE) return;

    const userCart = await tx.cart.findFirst({ where: { userId, status: CartStatus.ACTIVE } });
    if (!userCart) {
      await tx.cart.update({ where: { id: guestCart.id }, data: { userId, guestToken: null } });
      return;
    }

    for (const item of guestCart.items) {
      await tx.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        create: { cartId: userCart.id, productId: item.productId, variantId: item.variantId, quantity: item.quantity },
        update: { quantity: { increment: item.quantity } },
      });
    }

    await tx.cart.delete({ where: { id: guestCart.id } });
  });
}

export function calculateCartTotals(cart: CartWithItems) {
  const subtotal = cart.items.reduce((total, item) => total + item.variant.price * item.quantity, 0);
  return { subtotal, itemCount: cart.items.reduce((count, item) => count + item.quantity, 0) };
}
