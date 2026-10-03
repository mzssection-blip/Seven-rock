"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/modules/auth/session";

export type WishlistActionState = { error?: string; saved?: boolean } | undefined;

export async function toggleWishlistAction(_previous: WishlistActionState, formData: FormData): Promise<WishlistActionState> {
  const productId = z.string().cuid().safeParse(formData.get("productId"));
  if (!productId.success) return { error: "Invalid product." };

  try {
    const user = await requireUser();
    const existing = await db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: productId.data } } });
    if (existing) {
      await db.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/account/wishlist");
      return { saved: false };
    }
    await db.wishlistItem.create({ data: { userId: user.id, productId: productId.data } });
    revalidatePath("/account/wishlist");
    return { saved: true };
  } catch {
    return { error: "Sign in to save items to your wishlist." };
  }
}
