"use client";

import Link from "next/link";
import { useActionState } from "react";
import { checkoutAction, type CheckoutActionState } from "@/app/actions/checkout";
import { formatMoney } from "@/lib/format";

type Summary = { subtotal: number; itemCount: number; couponCode?: string | null };

const fieldClass = "field";

export function CheckoutForm({ summary, signedIn }: { summary: Summary | null; signedIn: boolean }) {
  const [state, action, pending] = useActionState<CheckoutActionState, FormData>(checkoutAction, undefined);

  if (state?.orderNumber) {
    return (
      <div className="mx-auto max-w-xl border border-white/10 px-6 py-14 text-center sm:px-10">
        <p className="meta !text-mist">Order received</p>
        <h1 className="display-title mt-4 text-5xl">Thank you.</h1>
        <p className="mt-5 text-sm leading-6 text-mist">
          Order <strong className="font-mono text-rust">{state.orderNumber}</strong> has been placed.
          We will confirm delivery details by phone.
        </p>
        {signedIn && <Link className="btn-solid mt-8 inline-flex" href="/account/orders">View your orders</Link>}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="mx-auto max-w-xl border border-white/10 px-6 py-14 text-center sm:px-10">
        <h1 className="display-title text-5xl">Your bag is empty.</h1>
        <p className="mt-4 text-sm text-mist">Add an available item before checkout.</p>
        <Link className="btn-solid mt-8 inline-flex" href="/shop">Shop the collection</Link>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
      <section>
        <p className="meta !text-mist">Secure checkout — 01 / Delivery</p>
        <h1 className="display-title mt-3 text-4xl sm:text-5xl">Checkout.</h1>
        {!signedIn && (
          <p className="mt-3 text-sm text-mist">
            Checking out as a guest. <Link className="link-line" href="/login">Sign in</Link> to track orders and save addresses.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="meta">Full name</span><input className={`${fieldClass} mt-2`} name="recipient" required /></label>
          <label className="block"><span className="meta">Phone</span><input className={`${fieldClass} mt-2`} inputMode="tel" name="phone" placeholder="01XXXXXXXXX" required /></label>
          <label className="block"><span className="meta">Email (optional)</span><input className={`${fieldClass} mt-2`} name="email" type="email" /></label>
          <label className="block"><span className="meta">Division</span><input className={`${fieldClass} mt-2`} name="division" placeholder="Dhaka" /></label>
          <label className="block"><span className="meta">District</span><input className={`${fieldClass} mt-2`} name="district" placeholder="Dhaka" required /></label>
          <label className="block sm:col-span-2"><span className="meta">Area / Upazila</span><input className={`${fieldClass} mt-2`} name="area" required /></label>
          <label className="block sm:col-span-2"><span className="meta">Address</span><input className={`${fieldClass} mt-2`} name="addressLine1" placeholder="House, road, village or landmark" required /></label>
          <label className="block sm:col-span-2"><span className="meta">Address line 2 (optional)</span><input className={`${fieldClass} mt-2`} name="addressLine2" /></label>
        </div>

        <fieldset className="mt-10 border-t border-white/10 pt-8">
          <legend className="meta">02 / Payment method</legend>
          <label className="mt-4 flex cursor-pointer items-center gap-4 border border-white/25 bg-graphite/60 p-4 text-sm transition hover:border-white/50">
            <input className="accent-rust" defaultChecked name="paymentMethod" type="radio" value="COD" />
            <span>
              <strong className="font-semibold">Cash on Delivery</strong>
              <span className="mt-1 block text-xs leading-5 text-mist">Available where enabled by the delivery zone.</span>
            </span>
          </label>
          <p className="mt-3 text-[11px] leading-5 text-mist">
            bKash, Nagad and online payment are provider-ready and remain unavailable until merchant credentials are configured.
          </p>
        </fieldset>

        <label className="mt-8 block border-t border-white/10 pt-8">
          <span className="meta">Order note (optional)</span>
          <textarea className={`${fieldClass} mt-2 min-h-24`} name="notes" />
        </label>

        {state?.error && <p aria-live="polite" className="mt-6 text-sm font-medium text-rust">{state.error}</p>}
      </section>

      <aside className="h-fit border border-white/10 bg-charcoal/60 p-6 lg:sticky lg:top-24">
        <p className="meta !text-mist">Order summary</p>
        <div className="mt-6 flex items-center justify-between border-b border-white/10 pb-5 text-sm">
          <span className="text-mist">{summary.itemCount} item{summary.itemCount === 1 ? "" : "s"}</span>
          <strong className="font-semibold">{formatMoney(summary.subtotal)}</strong>
        </div>
        {summary.couponCode && (
          <p className="mt-5 text-xs leading-5 text-mist">Coupon <strong className="font-mono text-paper">{summary.couponCode}</strong> will be verified before the order is placed.</p>
        )}
        <p className="mt-5 text-xs leading-5 text-mist">
          Delivery fees, coupon discount and final total are calculated securely after you submit your exact delivery area.
        </p>
        <button className="btn-rust mt-7 w-full" disabled={pending} type="submit">{pending ? "Placing order…" : "Place COD order"}</button>
        <p className="meta mt-4 text-center !text-mist/70">Encrypted submission — server-side verification</p>
      </aside>
    </form>
  );
}
