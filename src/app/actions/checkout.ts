"use server";

import { revalidatePath } from "next/cache";
import { checkoutSchema } from "@/lib/validation";
import { getCart } from "@/modules/cart/cart.service";
import { cartIdentityFromRequest } from "@/modules/cart/current-cart";
import { createOrderFromCart } from "@/modules/checkout/checkout.service";

export type CheckoutActionState = { error?: string; orderNumber?: string } | undefined;

export async function checkoutAction(_previous: CheckoutActionState, formData: FormData): Promise<CheckoutActionState> {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please review your delivery information." };

  const identity = await cartIdentityFromRequest();
  const cart = await getCart(identity);
  if (!cart) return { error: "Your bag is empty." };

  try {
    const order = await createOrderFromCart({
      cartId: cart.id,
      userId: identity.userId,
      checkout: {
        ...parsed.data,
        paymentMethod: parsed.data.paymentMethod,
      },
    });
    revalidatePath("/cart");
    revalidatePath("/admin/orders");
    return { orderNumber: order.number };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "We could not place your order." };
  }
}
