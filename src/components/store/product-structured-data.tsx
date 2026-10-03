import { absoluteUrl } from "@/lib/seo";

type ProductStructuredDataProps = {
  product: {
    name: string;
    slug: string;
    sku: string;
    shortDescription: string | null;
    description: string;
    category: { name: string };
    images: { url: string }[];
    variants: {
      sku: string;
      price: number;
      inventory: { onHand: number; reserved: number } | null;
    }[];
  };
};

export function ProductStructuredData({ product }: ProductStructuredDataProps) {
  const url = absoluteUrl(`/product/${product.slug}`);
  const images = product.images.map((image) => image.url);
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription || product.description,
    sku: product.sku,
    category: product.category.name,
    brand: { "@type": "Brand", name: "SEVEN ROCK" },
    url,
    ...(images.length ? { image: images } : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      url,
      sku: variant.sku,
      priceCurrency: "BDT",
      price: (variant.price / 100).toFixed(2),
      availability: variant.inventory && variant.inventory.onHand > variant.inventory.reserved
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    })),
  };

  return <script dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} type="application/ld+json" />;
}
