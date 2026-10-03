"use client";

import { Heart } from "lucide-react";
import { useActionState } from "react";
import { toggleWishlistAction, type WishlistActionState } from "@/app/actions/wishlist";

export function WishlistButton({ productId, compact = false, saved = false }: { productId: string; compact?: boolean; saved?: boolean }) {
  const [state, action, pending] = useActionState<WishlistActionState, FormData>(toggleWishlistAction, undefined);
  const isSaved = state?.saved ?? saved;
  return (
    <form action={action}>
      <input name="productId" type="hidden" value={productId} />
      <button
        aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        className={`grid place-items-center transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40 ${
          compact ? "h-9 w-9 text-paper/75 hover:text-rust" : "h-11 w-11 border border-white/20 text-paper/85 hover:border-white/60 hover:text-paper"
        } ${isSaved ? "text-rust" : ""}`}
        disabled={pending}
        type="submit"
      >
        <Heart className={`transition-transform duration-300 ${isSaved ? "fill-rust scale-110" : ""}`} size={compact ? 16 : 18} strokeWidth={1.5} />
      </button>
      {state?.error && <span className="sr-only">{state.error}</span>}
    </form>
  );
}
