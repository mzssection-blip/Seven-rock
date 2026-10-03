import type { Metadata } from "next";
import { ProductGrid } from "@/components/store/product-grid";
import { Reveal } from "@/components/store/reveal";
import { getSaleProducts } from "@/modules/catalog/catalog.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sale",
  description: "Discounted pieces from SEVEN ROCK — real markdowns on the live catalogue.",
  alternates: { canonical: "/sale" },
};

export default async function SalePage() {
  const products = await getSaleProducts();

  return (
    <div className="page-shell py-12 sm:py-16">
      <Reveal>
        <p className="meta">Sale — {products.length} {products.length === 1 ? "piece" : "pieces"}</p>
        <h1 className="display-wide mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] text-paper sm:text-7xl lg:text-8xl">
          Final<span className="text-rust"> cut.</span>
        </h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-mist">
          Markdowns straight from the live catalogue — every discount is real and reflected at checkout.
        </p>
      </Reveal>
      <Reveal className="mt-10">
        <ProductGrid eagerCount={4} products={products} />
      </Reveal>
    </div>
  );
}
