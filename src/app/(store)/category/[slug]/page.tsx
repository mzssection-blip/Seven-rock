import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/store/reveal";
import { getShopProducts, getVisibleCategories } from "@/modules/catalog/catalog.service";

export const dynamic = "force-dynamic";

type CategoryPageProps = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: "newest" | "price-asc" | "price-desc" }> };

const sortOptions = [["Newest", "newest"], ["Price low", "price-asc"], ["Price high", "price-desc"]] as const;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getVisibleCategories()).find((item) => item.slug === slug);
  if (!category) return {};

  const title = category.name;
  const description = category.description || `Shop ${category.name} from SEVEN ROCK.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { type: "website", title, description, url: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const [categories, result] = await Promise.all([getVisibleCategories(), getShopProducts({ category: slug, sort })]);
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();

  const index = categories.indexOf(category);
  const activeSort = sort ?? "newest";
  const hrefFor = (value: string) => `/category/${slug}?sort=${value}`;

  return (
    <div className="py-12 sm:py-16">
      <div className="page-shell">
        <Reveal>
          <p className="meta">
            Collection {String(index + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")} — {result.total} {result.total === 1 ? "piece" : "pieces"}
          </p>
          <h1 className="display-wide mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] text-paper sm:text-7xl lg:text-8xl">{category.name}</h1>
          {category.description && <p className="mt-5 max-w-xl text-sm leading-7 text-mist">{category.description}</p>}
        </Reveal>
        {category.imageUrl && (
          <Reveal className="relative mt-10 aspect-[21/10] overflow-hidden bg-charcoal sm:aspect-[21/7]">
            <Image alt={category.name} className="object-cover" fill priority={false} sizes="100vw" src={category.imageUrl} />
          </Reveal>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-white/10 py-4">
          <span className="meta text-mist/60">Sort</span>
          {sortOptions.map(([label, value]) => (
            <Link
              className={`border-b pb-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] transition-colors ${activeSort === value ? "border-rust text-paper" : "border-transparent text-mist hover:text-paper/80"}`}
              href={hrefFor(value)}
              key={value}
            >
              {label}
            </Link>
          ))}
        </div>
        <Reveal className="mt-8">
          <ProductGrid eagerCount={4} products={result.items} />
        </Reveal>
      </div>
    </div>
  );
}
