import { ProductEditor } from "@/components/admin/product-editor";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ select: { id: true, name: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return <ProductEditor categories={categories} />;
}
