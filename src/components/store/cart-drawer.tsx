import Image from "next/image";
import Link from "next/link";
import { updateCartQuantityAction } from "@/app/actions/cart";
import { formatMoney } from "@/lib/format";
import type { CartWithItems } from "@/modules/cart/cart.service";

export function CartDrawerContent({ cart, itemCount, subtotal }: { cart: CartWithItems | null; itemCount: number; subtotal: number }) {
  if (!cart?.items.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
        <p className="display-title text-2xl uppercase text-paper">Your bag is empty.</p>
        <p className="meta">Add pieces from the latest drop.</p>
        <Link className="btn-solid" href="/shop">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ul className="flex-1 divide-y divide-white/10 overflow-y-auto px-6">
        {cart.items.map((item) => (
          <li className="flex gap-4 py-5" key={item.id}>
            <Link className="relative block h-28 w-20 shrink-0 overflow-hidden bg-graphite" href={`/product/${item.product.slug}`}>
              {item.product.images[0]?.url && <Image alt={item.product.images[0].alt || item.product.name} className="object-cover" fill priority={false} sizes="80px" src={item.product.images[0].url} />}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <Link className="font-display text-sm font-semibold uppercase leading-snug tracking-[0.01em] text-paper transition-colors hover:text-white" href={`/product/${item.product.slug}`}>
                  {item.product.name}
                </Link>
                <p className="shrink-0 text-sm font-bold text-paper">{formatMoney(item.variant.price * item.quantity)}</p>
              </div>
              <p className="meta mt-1.5">{[item.variant.color, item.variant.size].filter(Boolean).join(" · ") || "Standard"}</p>
              <div className="mt-auto flex items-center gap-4 pt-3">
                <div className="flex items-center border border-white/15">
                  <form action={updateCartQuantityAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <input name="quantity" type="hidden" value={Math.max(0, item.quantity - 1)} />
                    <button aria-label={`Remove one ${item.product.name}`} className="grid h-8 w-8 place-items-center text-paper/80 transition-colors hover:text-paper" type="submit">
                      −
                    </button>
                  </form>
                  <span className="w-7 text-center text-xs font-bold text-paper">{item.quantity}</span>
                  <form action={updateCartQuantityAction}>
                    <input name="itemId" type="hidden" value={item.id} />
                    <input name="quantity" type="hidden" value={Math.min(10, item.quantity + 1)} />
                    <button aria-label={`Add one ${item.product.name}`} className="grid h-8 w-8 place-items-center text-paper/80 transition-colors hover:text-paper" type="submit">
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
      <div className="shrink-0 border-t border-white/10 p-6">
        <div className="flex items-baseline justify-between">
          <span className="meta">Subtotal — {itemCount} {itemCount === 1 ? "item" : "items"}</span>
          <span className="text-lg font-bold text-paper">{formatMoney(subtotal)}</span>
        </div>
        <p className="meta mt-2 text-mist/70">Delivery calculated at checkout</p>
        <Link className="btn-solid mt-5 w-full" href="/checkout">
          Checkout
        </Link>
        <Link className="meta mt-4 block text-center text-paper/70 transition-colors hover:text-paper" href="/cart">
          View full bag
        </Link>
      </div>
    </div>
  );
}
