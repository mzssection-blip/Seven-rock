import Link from "next/link";
import { Search } from "lucide-react";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/store/reveal";
import { getShopProducts, getVisibleCategories } from "@/modules/catalog/catalog.service";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string; sort?: "newest" | "price-asc" | "price-desc"; page?: string }>;

const sortOptions = [["Newest", "newest"], ["Price low", "price-asc"], ["Price high", "price-desc"]] as const;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    getShopProducts({ query: params.q, category: params.category, sort: params.sort, page: Number(params.page) || 1 }),
    getVisibleCategories(),
  ]);

  const createHref = (updates: Record<string, string | undefined>) => {
    const current = new URLSearchParams();
    Object.entries({ q: params.q, category: params.category, sort: params.sort, ...updates }).forEach(([key, value]) => {
      if (value) current.set(key, value);
    });
    return `/shop?${current.toString()}`;
  };

  const activeSort = params.sort ?? "newest";
  const filterClass = (active: boolean) =>
    `border-b pb-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] transition-colors ${
      active ? "border-rust text-paper" : "border-transparent text-mist hover:text-paper/80"
    }`;

  return (
    <div className="page-shell py-12 sm:py-16">
      <Reveal>
        <p className="meta">Catalogue — {result.total} {result.total === 1 ? "piece" : "pieces"}</p>
        <h1 className="display-wide mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] text-paper sm:text-7xl lg:text-8xl">
          {params.q ? "Search" : "All pieces"}
        </h1>
      </Reveal>

      <form action="/shop" className="mt-9 flex max-w-xl items-center gap-3 border-b border-white/25 pb-3 transition-colors focus-within:border-paper">
        <Search className="shrink-0 text-mist" size={18} strokeWidth={1.5} />
        <input
          className="w-full bg-transparent text-sm uppercase tracking-[0.08em] text-paper outline-none placeholder:text-mist/50"
          defaultValue={params.q}
          name="q"
          placeholder="Search products, categories or SKU"
          type="search"
        />
        {params.category && <input name="category" type="hidden" value={params.category} />}
      </form>

      <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-y border-white/10 py-4">
        <span className="meta text-mist/60">Category</span>
        <Link className={filterClass(!params.category)} href={createHref({ category: undefined, page: undefined })}>All</Link>
        {categories.map((category) => (
          <Link className={filterClass(params.category === category.slug)} href={createHref({ category: category.slug, page: undefined })} key={category.id}>
            {category.name}
          </Link>
        ))}
        <span aria-hidden className="mx-1 hidden h-4 w-px bg-white/15 lg:block" />
        <span className="meta text-mist/60">Sort</span>
        {sortOptions.map(([label, sort]) => (
          <Link className={filterClass(activeSort === sort)} href={createHref({ sort, page: undefined })} key={sort}>
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist">{params.q ? `Results for “${params.q}”` : "Full catalogue"}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-mist">
          Page {String(result.page).padStart(2, "0")} / {String(Math.max(result.pageCount, 1)).padStart(2, "0")}
        </p>
      </div>

      <Reveal className="mt-8">
        <ProductGrid eagerCount={4} products={result.items} />
      </Reveal>

      {result.pageCount > 1 && (
        <nav className="mt-16 flex items-center justify-center gap-10">
          <Link
            aria-disabled={result.page === 1}
            className="meta link-line text-paper/80 disabled:pointer-events-none disabled:opacity-30"
            href={createHref({ page: result.page > 1 ? String(result.page - 1) : undefined })}
          >
            ← Previous
          </Link>
          <span className="meta text-rust">{String(result.page).padStart(2, "0")}</span>
          <Link
            aria-disabled={result.page >= result.pageCount}
            className="meta link-line text-paper/80 disabled:pointer-events-none disabled:opacity-30"
            href={createHref({ page: result.page < result.pageCount ? String(result.page + 1) : undefined })}
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  );
}
