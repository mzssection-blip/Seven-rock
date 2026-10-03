"use client";

import { useActionState } from "react";
import { applyCouponAction, type CartActionState } from "@/app/actions/cart";

export function CouponForm({ initialValue }: { initialValue?: string | null }) {
  const [state, action, pending] = useActionState<CartActionState, FormData>(applyCouponAction, undefined);
  return (
    <form action={action} className="mt-5 border-t border-white/10 pt-5">
      <label className="meta" htmlFor="couponCode">Promo code</label>
      <div className="mt-3 flex gap-2">
        <input className="field flex-1" defaultValue={initialValue ?? ""} id="couponCode" name="couponCode" placeholder="Enter code" />
        <button className="btn-outline shrink-0" disabled={pending} type="submit">{pending ? "…" : "Apply"}</button>
      </div>
      {state?.error && <p className="mt-2 text-[11px] font-medium tracking-wide text-rust">{state.error}</p>}
      {state?.message && <p className="mt-2 text-[11px] font-medium tracking-wide text-mist">{state.message}</p>}
    </form>
  );
}
