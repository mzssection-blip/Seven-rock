import { ProductGrid } from "@/components/store/product-grid";
import { aiAvailability } from "@/lib/integrations/ai";
import { getShopProducts } from "@/modules/catalog/catalog.service";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const result = q ? await getShopProducts({ query: q }) : null;
  const ai = aiAvailability();
  return (
    <div className="page-shell py-12 sm:py-16">
      <p className="meta !text-mist">Discover SEVEN ROCK</p>
      <h1 className="display-title mt-3 text-5xl sm:text-6xl">Search the catalogue.</h1>
      <form className="mt-8 flex max-w-2xl items-center gap-3 border-b border-white/25 pb-3">
        <input autoFocus className="w-full bg-transparent text-lg text-paper placeholder:text-mist/50 focus:outline-none" defaultValue={q} name="q" placeholder="Try “oversized black t-shirt”" />
        <button className="meta shrink-0 !text-paper hover:!text-rust" type="submit">Search →</button>
      </form>
      <p className="mt-4 max-w-2xl text-xs leading-5 text-mist">
        {ai.configured
          ? "AI product search is configured — describe a look in natural language to receive matches from the live catalogue."
          : "Standard search only returns real, in-stock catalogue products — no filler results."}
      </p>
      {result && (
        <section className="mt-12">
          <p className="meta !text-mist">{result.total} result{result.total === 1 ? "" : "s"} for “{q}”</p>
          <div className="mt-6"><ProductGrid eagerCount={2} products={result.items} /></div>
        </section>
      )}
    </div>
  );
}
