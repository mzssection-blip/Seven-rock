"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { addCartItem, getCart, getOrCreateCart, updateCartItemQuantity } from "@/modules/cart/cart.service";
import { cartIdentityFromRequest, ensureCartIdentity } from "@/modules/cart/current-cart";

export type CartActionState = { error?: string; message?: string } | undefined;

const addItemSchema = z.object({
  productId: z.string().cuid(),
  variantId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1).max(10),
});

export async function addToCartAction(_previous: CartActionState, formData: FormData): Promise<CartActionState> {
  const parsed = addItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Choose an available size and color." };

  try {
    const identity = await ensureCartIdentity();
    const cart = await getOrCreateCart(identity);
    await addCartItem(cart.id, parsed.data.productId, parsed.data.variantId, parsed.data.quantity);
    revalidatePath("/", "layout");
    revalidatePath("/cart");
    revalidatePath("/shop");
    revalidatePath(`/product/${formData.get("slug")}`);
    return { message: "Added to your bag." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to add this item." };
  }
}

export async function buyNowAction(_previous: CartActionState, formData: FormData): Promise<CartActionState> {
  const result = await addToCartAction(_previous, formData);
  if (result?.error) return result;
  revalidatePath("/checkout");
  redirect("/checkout");
}

const quantitySchema = z.object({ itemId: z.string().cuid(), quantity: z.coerce.number().int().min(0).max(10) });

export async function updateCartQuantityAction(formData: FormData) {
  const parsed = quantitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid cart update.");

  const identity = await cartIdentityFromRequest();
  const cart = await getCart(identity);
  if (!cart) throw new Error("Your bag was not found.");
  const item = await db.cartItem.findFirst({ where: { id: parsed.data.itemId, cartId: cart.id } });
  if (!item) throw new Error("Cart item was not found.");

  await updateCartItemQuantity(item.id, parsed.data.quantity);
  revalidatePath("/", "layout");
  revalidatePath("/cart");
}

export async function applyCouponAction(_previous: CartActionState, formData: FormData): Promise<CartActionState> {
  const code = String(formData.get("couponCode") ?? "").trim().toUpperCase();
  const identity = await cartIdentityFromRequest();
  const cart = await getCart(identity);
  if (!cart) return { error: "Add an item before applying a coupon." };

  if (code) {
    const coupon = await db.coupon.findUnique({ where: { code } });
    if (!coupon?.isActive) return { error: "That coupon is unavailable." };
  }

  await db.cart.update({ where: { id: cart.id }, data: { couponCode: code || null } });
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { message: code ? "Coupon applied. It will be verified at checkout." : "Coupon removed." };
}
