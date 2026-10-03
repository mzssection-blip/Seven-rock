import { CategoryForm } from "@/components/admin/category-form";
import { db } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({ include: { parent: { select: { name: true } }, _count: { select: { products: true, children: true } } }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const choices = categories.map((category) => ({ id: category.id, name: category.name }));
  return <div><div><p className="eyebrow">Catalog taxonomy</p><h1 className="display-title mt-1 text-5xl">Categories</h1></div><section className="surface mt-8 p-5"><p className="mb-4 text-sm font-bold">Create category</p><CategoryForm categories={choices} /></section><div className="mt-8 space-y-4">{categories.map((category) => <details className="surface group" key={category.id}><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-bold">{category.name}</p><p className="mt-1 text-xs text-[#6e675e]">/{category.slug} · {category._count.products} product{category._count.products === 1 ? "" : "s"}{category.parent ? ` · under ${category.parent.name}` : ""}</p></div><span className="bg-[#e8e3da] px-2 py-1 text-[10px] font-bold tracking-wide">{category.isVisible ? "VISIBLE" : "HIDDEN"}</span></summary><div className="border-t border-black/10 p-5"><CategoryForm categories={choices} category={category} /></div></details>)}</div></div>;
}
