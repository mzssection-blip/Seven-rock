"use client";

import { useActionState } from "react";
import { addToCartAction, type CartActionState } from "@/app/actions/cart";

export function QuickAddButton({ productId, variantId, slug }: { productId: string; variantId: string; slug: string }) {
  const [state, action, pending] = useActionState<CartActionState, FormData>(addToCartAction, undefined);
  return (
    <form action={action}>
      <input name="productId" type="hidden" value={productId} />
      <input name="variantId" type="hidden" value={variantId} />
      <input name="quantity" type="hidden" value={1} />
      <input name="slug" type="hidden" value={slug} />
      <button
        className="block w-full bg-ink/90 px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-paper backdrop-blur transition-colors duration-300 hover:bg-rust disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Adding…" : state?.message ? "Added — view bag" : state?.error ? "Unavailable" : "Quick add"}
      </button>
    </form>
  );
}
