import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/store/reveal";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { getBestSellers, getFeaturedProducts, getNewArrivals, getVisibleCategories } from "@/modules/catalog/catalog.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [newArrivals, bestSellers, featured, categories, zones] = await Promise.all([
    getNewArrivals(8),
    getBestSellers(8),
    getFeaturedProducts(8),
    getVisibleCategories(),
    db.deliveryZone.findMany({ where: { isActive: true }, select: { type: true, baseFee: true, freeShippingOver: true, isCodEnabled: true } }),
  ]);

  const dhaka = zones.find((zone) => zone.type === "DHAKA");
  const outside = zones.find((zone) => zone.type === "OUTSIDE_DHAKA");
  const codEnabled = zones.some((zone) => zone.isCodEnabled);
  const freeOver = zones.map((zone) => zone.freeShippingOver).filter((value): value is number => value !== null);
  const freeOverMin = freeOver.length ? Math.min(...freeOver) : null;

  const marqueeItems = [
    freeOverMin ? `Free delivery over ${formatMoney(freeOverMin)}` : null,
    codEnabled ? "Cash on delivery available" : null,
    dhaka && outside ? `Dhaka ${formatMoney(dhaka.baseFee)} / outside ${formatMoney(outside.baseFee)}` : null,
    "New drop 01 — live now",
    "SEVEN ROCK — future menswear",
  ].filter((item): item is string => item !== null);

  const editHero = featured[0];
  const editSide = featured.slice(1, 3);

  return (
    <div>
      <section className="relative -mt-16 flex min-h-[100svh] items-end overflow-hidden lg:-mt-[72px]">
        <Image
          alt="SEVEN ROCK editorial hero — future menswear campaign"
          className="object-cover"
          fetchPriority="high"
          fill
          loading="eager"
          sizes="100vw"
          src="/images/editorial/hero.webp"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/45" />
        <div className="page-shell relative w-full pb-12 pt-40 sm:pb-16">
          <p className="meta animate-rise">SEVEN ROCK — COLLECTION 01 / 2026</p>
          <h1 className="display-wide mt-5 font-display text-[15vw] font-extrabold uppercase leading-[0.87] text-paper sm:text-[12vw] lg:text-[9vw]">
            Built for
            <br />
            the next era.
          </h1>
          <div className="mt-9 flex flex-wrap items-center gap-4 animate-rise" style={{ animationDelay: "120ms" }}>
            <Link className="btn-solid" href="/shop">
              Shop the collection
              <ArrowUpRight size={15} strokeWidth={2} />
            </Link>
            <Link className="btn-outline" href="/shop?sort=newest">
              View new drop
            </Link>
          </div>
          <p className="meta mt-9 flex items-center gap-3 animate-rise" style={{ animationDelay: "240ms" }}>
            <span aria-hidden className="inline-block h-1.5 w-1.5 animate-blink rounded-full bg-rust" />
            NEW DROP 01 — LIVE NOW
          </p>
        </div>
      </section>

      {marqueeItems.length > 0 && (
        <div className="overflow-hidden border-y border-white/10 py-3.5">
          <div className="flex w-max animate-marquee gap-12">
            {[0, 1].map((copy) => (
              <div aria-hidden={copy === 1} className="flex shrink-0 gap-12" key={copy}>
                {marqueeItems.map((item) => (
                  <span className="flex items-center gap-12 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-mist" key={`${copy}-${item}`}>
                    {item}
                    <span aria-hidden className="text-rust">/</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="border-b border-white/10 py-16 sm:py-24">
        <Reveal>
          <div className="page-shell flex items-end justify-between gap-6">
            <div>
              <p className="meta">01 / New drop</p>
              <h2 className="display-title mt-3 text-4xl uppercase leading-none text-paper sm:text-5xl lg:text-6xl">Latest arrivals</h2>
            </div>
            <Link className="meta link-line shrink-0 text-paper/80" href="/shop?sort=newest">
              View all →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 flex snap-x gap-3 overflow-x-auto px-4 pb-2 no-scrollbar-hidden sm:gap-4 sm:px-6 lg:px-10">
          {newArrivals.map((product, index) => (
            <div className="w-[68vw] shrink-0 snap-start sm:w-[40vw] lg:w-[23%]" key={product.id}>
              <ProductCard eager={index < 2} product={product} />
            </div>
          ))}
        </div>
      </section>

      {editHero && (
        <section className="border-b border-white/10 py-16 sm:py-24" id="edit">
          <Reveal>
            <div className="page-shell grid gap-10 lg:grid-cols-12 lg:gap-x-10">
              <div className="lg:col-span-7">
                <p className="meta">02 / The edit</p>
                <Link className="group relative mt-3 block aspect-[4/5] overflow-hidden bg-charcoal" href={`/product/${editHero.slug}`}>
                  {editHero.images[0]?.url && (
                    <Image
                      alt={editHero.images[0].alt || editHero.name}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      src={editHero.images[0].url}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/90 to-transparent p-6 pt-16">
                    <div>
                      <p className="meta !text-paper/70">{editHero.category.name}</p>
                      <p className="mt-2 font-display text-2xl font-bold uppercase tracking-[0.01em] text-paper sm:text-3xl">{editHero.name}</p>
                    </div>
                    {editHero.variants[0] && (
                      <p className="shrink-0 font-mono text-sm font-semibold text-paper">{formatMoney(editHero.variants[0].price)}</p>
                    )}
                  </div>
                </Link>
              </div>
              <div className="lg:col-span-5 lg:pt-12">
                <h2 className="display-title text-4xl uppercase leading-[0.95] text-paper sm:text-5xl">
                  Curated by
                  <br />
                  the studio.
                </h2>
                <p className="mt-5 max-w-sm text-sm leading-7 text-mist">
                  The pieces defining this season&apos;s silhouette language — cut, fabric and fit chosen by the SEVEN ROCK studio for the way you actually move through the city.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  {editSide.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Link className="meta mt-9 inline-flex items-center gap-2 link-line text-paper/80" href="/shop">
                  Browse the full catalogue
                  <ArrowUpRight size={13} strokeWidth={2} />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden border-b border-white/10">
        <Image
          alt="SEVEN ROCK 2026 campaign"
          className="object-cover"
          fill
          sizes="100vw"
          src="/images/editorial/campaign.webp"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/55" />
        <Reveal className="relative page-shell py-20 text-center">
          <p className="meta">Campaign — 2026</p>
          <h2 className="display-wide mt-5 font-display text-[13vw] font-extrabold uppercase leading-[0.9] text-paper sm:text-8xl">Wear the future.</h2>
          <Link className="btn-outline mt-10" href="/shop">
            Shop the campaign
            <ArrowUpRight size={15} strokeWidth={2} />
          </Link>
        </Reveal>
      </section>

      <section className="py-16 sm:py-24">
        <Reveal>
          <div className="page-shell flex items-end justify-between gap-6">
            <div>
              <p className="meta">03 / Best sellers</p>
              <h2 className="display-title mt-3 text-4xl uppercase leading-none text-paper sm:text-5xl lg:text-6xl">The rotation</h2>
            </div>
            <Link className="meta link-line shrink-0 text-paper/80" href="/shop">
              View all →
            </Link>
          </div>
        </Reveal>
        <Reveal className="page-shell mt-10">
          <ProductGrid eagerCount={4} products={bestSellers} />
        </Reveal>
      </section>

      <section className="border-y border-white/10">
        <div className="page-shell py-16 sm:py-20">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="meta">04 / Collections</p>
                <h2 className="display-title mt-3 text-4xl uppercase leading-none text-paper sm:text-5xl">Shop by category</h2>
              </div>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-x-10 sm:grid-cols-2">
            {categories.map((category, index) => (
              <Reveal key={category.id}>
                <Link className="group flex items-center justify-between gap-6 border-t border-white/10 py-5 transition-colors hover:bg-white/[0.03]" href={`/category/${category.slug}`}>
                  <div className="flex items-baseline gap-6">
                    <span className="meta">{String(index + 1).padStart(2, "0")}</span>
                    <span className="font-display text-xl font-semibold uppercase tracking-[0.01em] text-paper/85 transition-colors group-hover:text-paper sm:text-2xl">{category.name}</span>
                  </div>
                  <ArrowUpRight className="shrink-0 text-mist transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" size={18} strokeWidth={1.5} />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal>
          <div>
            <p className="meta text-rust">Delivery</p>
            <p className="mt-3 text-sm leading-6 text-paper/85">
              {dhaka ? `Dhaka ${formatMoney(dhaka.baseFee)}` : "Nationwide delivery"}
              {outside ? ` · Outside ${formatMoney(outside.baseFee)}` : ""}
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <div>
            <p className="meta text-rust">Free shipping</p>
            <p className="mt-3 text-sm leading-6 text-paper/85">{freeOverMin ? `On every order over ${formatMoney(freeOverMin)}.` : "Available across Bangladesh."}</p>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <div>
            <p className="meta text-rust">Payment</p>
            <p className="mt-3 text-sm leading-6 text-paper/85">{codEnabled ? "Cash on delivery — pay when it arrives." : "Secure checkout."}</p>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div>
            <p className="meta text-rust">Origin</p>
            <p className="mt-3 text-sm leading-6 text-paper/85">Designed and shipped from Dhaka, Bangladesh.</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
