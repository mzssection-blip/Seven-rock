import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { db } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ include: { images: { orderBy: { sortOrder: "asc" } }, attributes: { orderBy: { name: "asc" } }, variants: { include: { inventory: true }, orderBy: { createdAt: "asc" } } }, where: { id } }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);
  if (!product) notFound();
  return <ProductEditor categories={categories} product={product} />;
}
