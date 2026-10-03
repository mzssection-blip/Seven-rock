import Image from "next/image";
import Link from "next/link";
import { updateCartQuantityAction } from "@/app/actions/cart";
import { CouponForm } from "@/components/store/coupon-form";
import { Reveal } from "@/components/store/reveal";
import { formatMoney } from "@/lib/format";
import { calculateCartTotals, getCart } from "@/modules/cart/cart.service";
import { cartIdentityFromRequest } from "@/modules/cart/current-cart";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const identity = await cartIdentityFromRequest();
  const cart = await getCart(identity);
  const totals = cart ? calculateCartTotals(cart) : { subtotal: 0, itemCount: 0 };

  return (
    <div className="page-shell py-12 sm:py-16">
      <Reveal>
        <p className="meta">
          Your bag — {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
        </p>
        <h1 className="display-wide mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] text-paper sm:text-7xl">Shopping bag</h1>
      </Reveal>

      {!cart?.items.length ? (
        <div className="mt-12 flex min-h-72 flex-col items-center justify-center gap-6 border border-white/10 p-8 text-center">
          <p className="display-title text-3xl uppercase text-paper">Your bag is empty.</p>
          <p className="meta">Find your next everyday essential.</p>
          <Link className="btn-solid" href="/shop">
            Shop the collection
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
          <section>
            <ul className="divide-y divide-white/10 border-t border-white/10">
              {cart.items.map((item) => (
                <li className="flex gap-5 py-6" key={item.id}>
                  <Link className="relative block h-36 w-28 shrink-0 overflow-hidden bg-graphite" href={`/product/${item.product.slug}`}>
                    {item.product.images[0]?.url && (
                      <Image alt={item.product.images[0].alt || item.product.name} className="object-cover" fill priority={false} sizes="112px" src={item.product.images[0].url} />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link className="font-display text-base font-semibold uppercase leading-snug tracking-[0.01em] text-paper transition-colors hover:text-white" href={`/product/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                        <p className="meta mt-1.5">{[item.variant.color, item.variant.size].filter(Boolean).join(" · ") || "Standard"}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/70">{formatMoney(item.variant.price)} each</p>
                      </div>
                      <p className="shrink-0 text-base font-bold text-paper">{formatMoney(item.variant.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-4 pt-4">
                      <div className="flex items-center border border-white/15">
                        <form action={updateCartQuantityAction}>
                          <input name="itemId" type="hidden" value={item.id} />
                          <input name="quantity" type="hidden" value={Math.max(0, item.quantity - 1)} />
                          <button aria-label={`Remove one ${item.product.name}`} className="grid h-9 w-9 place-items-center text-paper/80 transition-colors hover:text-paper" type="submit">
                            −
                          </button>
                        </form>
                        <span className="w-8 text-center text-sm font-bold text-paper">{item.quantity}</span>
                        <form action={updateCartQuantityAction}>
                          <input name="itemId" type="hidden" value={item.id} />
                          <input name="quantity" type="hidden" value={Math.min(10, item.quantity + 1)} />
                          <button aria-label={`Add one ${item.product.name}`} className="grid h-9 w-9 place-items-center text-paper/80 transition-colors hover:text-paper" type="submit">
                            +
                          </button>
                        </form>
                      </div>
                      <form action={updateCartQuantityAction}>
                        <input name="itemId" type="hidden" value={item.id} />
                        <input name="quantity" type="hidden" value="0" />
                        <button className="meta transition-colors hover:text-rust" type="submit">
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="h-fit border border-white/10 p-6 sm:p-7 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold uppercase tracking-[0.02em] text-paper">Order summary</h2>
            <div className="mt-6 space-y-4 border-b border-white/10 pb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-mist">Subtotal ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})</span>
                <span className="text-base font-bold text-paper">{formatMoney(totals.subtotal)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-mist">Delivery</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">At checkout</span>
              </div>
            </div>
            <CouponForm initialValue={cart.couponCode} />
            <Link className="btn-solid mt-6 w-full" href="/checkout">
              Continue to checkout
            </Link>
            <Link className="meta mt-4 block text-center text-paper/70 transition-colors hover:text-paper" href="/shop">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
