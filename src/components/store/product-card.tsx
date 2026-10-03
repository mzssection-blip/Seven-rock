import Image from "next/image";
import Link from "next/link";
import { discountPercentage, formatMoney } from "@/lib/format";
import type { ProductCard } from "@/modules/catalog/catalog.service";
import { QuickAddButton } from "./quick-add-button";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({ product, eager = false }: { product: ProductCard; eager?: boolean }) {
  const variant = product.variants[0];
  const secondary = product.images[1]?.url;
  const discount = variant ? discountPercentage(variant.price, variant.compareAtPrice) : null;
  const available = product.variants.some((item) => item.inventory && item.inventory.onHand > item.inventory.reserved);
  const singleVariant = product.variants.length === 1 ? product.variants[0] : null;
  const quickAddVariant = singleVariant && singleVariant.inventory && singleVariant.inventory.onHand > singleVariant.inventory.reserved ? singleVariant : null;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-charcoal">
        {product.images[0]?.url ? (
          <>
            <Image
              alt={product.images[0].alt || product.name}
              className="object-cover transition-opacity duration-700 group-hover:opacity-0"
              fill
              loading={eager ? "eager" : "lazy"}
              priority={false}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              src={product.images[0].url}
            />
            {secondary && (
              <Image
                alt={product.images[1]?.alt || product.name}
                className="scale-[1.04] object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                src={secondary}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-end p-5">
            <span className="meta">SEVEN ROCK</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-1.5">
            {product.isNewArrival && available && <span className="bg-ink/70 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-paper backdrop-blur-sm">New</span>}
            {discount && <span className="bg-rust/90 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-white backdrop-blur-sm">-{discount}%</span>}
          </div>
          {!available && <span className="bg-ink/70 px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-[0.24em] text-paper backdrop-blur-sm">Sold out</span>}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-lg:opacity-100">
          <div className="bg-ink/60 backdrop-blur-sm">
            <WishlistButton compact productId={product.id} />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0 sm:block">
          {quickAddVariant ? (
            <QuickAddButton productId={product.id} slug={product.slug} variantId={quickAddVariant.id} />
          ) : (
            <Link
              className="block w-full bg-ink/90 px-4 py-3.5 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-paper backdrop-blur transition-colors duration-300 hover:bg-rust"
              href={`/product/${product.slug}`}
            >
              {product.variants.length > 1 ? "Choose size" : "View product"}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="meta !text-mist/80">{product.category.name}</p>
        <Link className="mt-2 block font-display text-[15px] font-semibold uppercase leading-snug tracking-[0.01em] text-paper transition-colors hover:text-white" href={`/product/${product.slug}`}>
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2.5">
          {variant ? (
            <>
              <span className="text-sm font-bold tracking-wide text-paper">{formatMoney(variant.price)}</span>
              {variant.compareAtPrice && <span className="text-xs font-normal text-mist line-through">{formatMoney(variant.compareAtPrice)}</span>}
            </>
          ) : (
            <span className="text-xs text-mist">Unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
