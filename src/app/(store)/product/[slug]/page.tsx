import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { AddToCartForm } from "@/components/store/add-to-cart-form";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductStructuredData } from "@/components/store/product-structured-data";
import { Reveal } from "@/components/store/reveal";
import { WishlistButton } from "@/components/store/wishlist-button";
import { db } from "@/lib/db";
import { discountPercentage, formatDate, formatMoney } from "@/lib/format";
import { getCurrentUser } from "@/modules/auth/session";
import { getProductBySlug, getShopProducts } from "@/modules/catalog/catalog.service";

export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.shortDescription || product.description;
  const image = product.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const user = await getCurrentUser();
  const [related, wishlistItem] = await Promise.all([
    getShopProducts({ category: product.category.slug, pageSize: 5 }),
    user ? db.wishlistItem.findUnique({ where: { userId_productId: { userId: user.id, productId: product.id } } }) : null,
  ]);
  const fromPrice = product.variants[0]?.price;
  const compareAt = product.variants[0]?.compareAtPrice;
  const discount = fromPrice ? discountPercentage(fromPrice, compareAt) : null;
  const inStock = product.variants.some((variant) => variant.inventory && variant.inventory.onHand > variant.inventory.reserved);

  return (
    <div className="py-8 sm:py-12">
      <ProductStructuredData product={product} />

      <div className="page-shell">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist">
          <Link className="transition-colors hover:text-paper" href="/shop">Shop</Link>
          <span className="mx-2 text-mist/50">/</span>
          <Link className="transition-colors hover:text-paper" href={`/category/${product.category.slug}`}>{product.category.name}</Link>
        </p>
      </div>

      <div className="page-shell mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-start justify-between gap-4">
            <p className="meta">{product.category.name}</p>
            <WishlistButton productId={product.id} saved={Boolean(wishlistItem)} />
          </div>
          <h1 className="display-title mt-3 text-4xl font-extrabold uppercase leading-[0.95] text-paper sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {fromPrice ? <p className="text-2xl font-bold tracking-wide text-paper">{formatMoney(fromPrice)}</p> : <p className="text-sm text-mist">Unavailable</p>}
            {compareAt && <p className="text-sm text-mist line-through">{formatMoney(compareAt)}</p>}
            {discount && <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-rust">-{discount}%</span>}
          </div>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
            SKU {product.variants[0]?.sku ?? product.slug.toUpperCase()} — {inStock ? "IN STOCK" : "SOLD OUT"}
          </p>

          {product.shortDescription && <p className="mt-6 text-sm leading-7 text-paper/75">{product.shortDescription}</p>}

          <div className="mt-8 border-t border-white/10 pt-7">
            <p className="meta mb-5">01 / Select fit</p>
            <AddToCartForm
              productId={product.id}
              slug={product.slug}
              variants={product.variants.map((variant) => ({
                id: variant.id,
                color: variant.color,
                size: variant.size,
                available: Boolean(variant.inventory && variant.inventory.onHand > variant.inventory.reserved),
              }))}
            />
          </div>

          <div className="mt-8 space-y-4 border-t border-white/10 pt-7">
            <div className="flex gap-4">
              <Truck className="mt-0.5 shrink-0 text-mist" size={17} strokeWidth={1.5} />
              <p className="text-sm leading-6 text-paper/75">
                <span className="font-semibold text-paper">Nationwide delivery</span>
                <br />
                Dhaka ৳80 · outside Dhaka ৳130 · free over ৳5,000. COD availability confirmed at checkout.
              </p>
            </div>
            <div className="flex gap-4">
              <RotateCcw className="mt-0.5 shrink-0 text-mist" size={17} strokeWidth={1.5} />
              <p className="text-sm leading-6 text-paper/75">
                <span className="font-semibold text-paper">7-day easy returns</span>
                <br />
                Unworn pieces with tags — see the <Link className="underline underline-offset-2 hover:text-paper" href="/returns">return policy</Link>.
              </p>
            </div>
            <div className="flex gap-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-mist" size={17} strokeWidth={1.5} />
              <p className="text-sm leading-6 text-paper/75">
                <span className="font-semibold text-paper">Quality checked</span>
                <br />
                Every piece is inspected in Dhaka before dispatch.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10">
            <details className="group border-b border-white/10 py-4" open>
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-paper">
                Details
                <span aria-hidden className="text-mist transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="mt-4 text-sm leading-7 text-paper/75">
                <p className="whitespace-pre-line">{product.description}</p>
                {product.attributes.length > 0 && (
                  <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 border-t border-white/10 pt-4">
                    {product.attributes.map((attribute) => (
                      <div className="contents" key={attribute.id}>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{attribute.name}</dt>
                        <dd className="text-paper/85">{attribute.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </details>
            <details className="group border-b border-white/10 py-4">
              <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-paper">
                Size guide
                <span aria-hidden className="text-mist transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-paper/75">
                Fits run true to Bangladeshi standard sizing. Between sizes? Size up for the intended oversized drape. Full measurements on the{" "}
                <Link className="underline underline-offset-2 hover:text-paper" href="/size-guide">size guide page</Link>.
              </p>
            </details>
          </div>

          {product.reviews.length > 0 && (
            <div className="mt-8 border-t border-white/10 pt-7">
              <p className="meta mb-5">Reviews</p>
              <div className="space-y-5">
                {product.reviews.map((review) => (
                  <div className="border-b border-white/10 pb-5 last:border-b-0 last:pb-0" key={review.id}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-rust">
                      {"★".repeat(review.rating)}
                      <span className="text-mist/50">{"★".repeat(5 - review.rating)}</span>
                    </p>
                    <p className="mt-2 text-sm font-semibold text-paper">{review.user.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                      {formatDate(review.createdAt)}
                      {review.isVerified ? " — verified order" : ""}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-paper/80">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="mt-20 border-t border-white/10 pt-14">
        <div className="page-shell">
          <Reveal>
            <p className="meta">Keep exploring</p>
            <h2 className="display-title mt-3 text-3xl uppercase leading-none text-paper sm:text-4xl">More from {product.category.name}</h2>
          </Reveal>
          <Reveal className="mt-8">
            <ProductGrid products={related.items.filter((item) => item.id !== product.id).slice(0, 4)} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
