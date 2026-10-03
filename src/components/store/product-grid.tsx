import type { ProductCard as ProductCardType } from "@/modules/catalog/catalog.service";
import { ProductCard } from "./product-card";

export function ProductGrid({ products, eagerCount = 0 }: { products: ProductCardType[]; eagerCount?: number }) {
  if (!products.length)
    return (
      <div className="flex min-h-72 flex-col items-center justify-center border border-white/10 px-6 text-center">
        <p className="display-title text-3xl uppercase text-paper">Nothing here yet.</p>
        <p className="mt-3 max-w-md font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Try a different search — or check back when the next collection drops.</p>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, index) => (
        <ProductCard eager={index < eagerCount} key={product.id} product={product} />
      ))}
    </div>
  );
}
