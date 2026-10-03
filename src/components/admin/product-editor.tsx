"use client";

import { Plus, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { saveProductAction, type AdminActionState } from "@/app/actions/admin";

type VariantDraft = {
  id?: string;
  sku: string;
  color: string;
  size: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  reorderLevel: number;
  isActive: boolean;
};

type PersistedVariant = {
  id: string;
  sku: string;
  color: string | null;
  size: string | null;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  isActive: boolean;
  inventory: { onHand: number; reorderLevel: number } | null;
};

type ProductEditorProps = {
  categories: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    categoryId: string;
    shortDescription: string | null;
    description: string;
    tags: string[];
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    isFeatured: boolean;
    isNewArrival: boolean;
    isBestSeller: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    images: { url: string }[];
    attributes: { name: string; value: string }[];
    variants: PersistedVariant[];
  };
};

function emptyVariant(): VariantDraft {
  return { sku: "", color: "", size: "", price: 0, compareAtPrice: null, costPrice: null, stock: 0, reorderLevel: 5, isActive: true };
}

export function ProductEditor({ categories, product }: ProductEditorProps) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveProductAction, undefined);
  const [variants, setVariants] = useState<VariantDraft[]>(product?.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    color: variant.color ?? "",
    size: variant.size ?? "",
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    costPrice: variant.costPrice,
    stock: variant.inventory?.onHand ?? 0,
    reorderLevel: variant.inventory?.reorderLevel ?? 5,
    isActive: variant.isActive,
  })) ?? [emptyVariant()]);

  function updateVariant<K extends keyof VariantDraft>(index: number, key: K, value: VariantDraft[K]) {
    setVariants((current) => current.map((variant, itemIndex) => itemIndex === index ? { ...variant, [key]: value } : variant));
  }

  return <form action={action} className="space-y-6"><input name="productId" type="hidden" value={product?.id ?? ""} /><input name="variants" type="hidden" value={JSON.stringify(variants)} />
    <section className="surface p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Catalog</p><h1 className="display-title mt-1 text-4xl">{product ? "Edit product" : "New product"}</h1></div><button className="button-primary" disabled={pending} type="submit">{pending ? "Saving…" : "Save product"}</button></div>{state?.error && <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}{state?.success && <p className="mt-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{state.success}</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">Name<input className="input-field mt-2" defaultValue={product?.name} name="name" required /></label><label className="text-sm font-bold">Product SKU<input className="input-field mt-2" defaultValue={product?.sku} name="sku" required /></label><label className="text-sm font-bold">Slug<input className="input-field mt-2" defaultValue={product?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label className="text-sm font-bold">Category<select className="input-field mt-2" defaultValue={product?.categoryId} name="categoryId" required><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-bold md:col-span-2">Short description<textarea className="input-field mt-2 min-h-20" defaultValue={product?.shortDescription ?? ""} name="shortDescription" maxLength={280} /></label><label className="text-sm font-bold md:col-span-2">Description<textarea className="input-field mt-2 min-h-40" defaultValue={product?.description} name="description" required /></label><label className="text-sm font-bold md:col-span-2">Tags <span className="font-normal text-[#6e675e]">(comma-separated)</span><input className="input-field mt-2" defaultValue={product?.tags.join(", ") ?? ""} name="tags" /></label></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">Status<select className="input-field mt-2" defaultValue={product?.status ?? "DRAFT"} name="status"><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label><div className="flex flex-wrap items-end gap-4 pb-3 text-sm font-bold"><label className="flex items-center gap-2"><input defaultChecked={product?.isFeatured} name="isFeatured" type="checkbox" /> Featured</label><label className="flex items-center gap-2"><input defaultChecked={product?.isNewArrival} name="isNewArrival" type="checkbox" /> New arrival</label><label className="flex items-center gap-2"><input defaultChecked={product?.isBestSeller} name="isBestSeller" type="checkbox" /> Best seller</label></div></div>
    </section>
    <section className="surface p-5 sm:p-6"><p className="eyebrow">Media and detail</p><div className="mt-5 grid gap-4"><label className="text-sm font-bold">Image URLs <span className="font-normal text-[#6e675e]">(one per line)</span><textarea className="input-field mt-2 min-h-28" defaultValue={product?.images.map((image) => image.url).join("\n") ?? ""} name="imageUrls" /></label><label className="text-sm font-bold">Attributes <span className="font-normal text-[#6e675e]">(one Name: value pair per line)</span><textarea className="input-field mt-2 min-h-28" defaultValue={product?.attributes.map((attribute) => `${attribute.name}: ${attribute.value}`).join("\n") ?? ""} name="attributes" /></label><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">SEO title<input className="input-field mt-2" defaultValue={product?.metaTitle ?? ""} name="metaTitle" maxLength={70} /></label><label className="text-sm font-bold">SEO description<textarea className="input-field mt-2 min-h-20" defaultValue={product?.metaDescription ?? ""} name="metaDescription" maxLength={160} /></label></div></div>
    </section>
    <section className="surface p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Variants</p><p className="mt-1 text-sm text-[#6e675e]">Existing stock is adjusted only from Inventory to preserve its ledger.</p></div><button className="button-secondary px-3 py-2" onClick={() => setVariants((current) => [...current, emptyVariant()])} type="button"><Plus size={16} /> Add variant</button></div><div className="mt-5 space-y-4">{variants.map((variant, index) => <article className="border border-black/10 p-4" key={variant.id ?? `new-${index}`}><div className="mb-3 flex items-center justify-between"><p className="text-sm font-bold">Variant {index + 1}</p>{!variant.id && variants.length > 1 && <button aria-label="Remove variant" className="rounded-full p-2 text-red-700 hover:bg-red-50" onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 size={16} /></button>}</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold">SKU<input className="input-field mt-1" onChange={(event) => updateVariant(index, "sku", event.target.value.toUpperCase())} required value={variant.sku} /></label><label className="text-xs font-bold">Color<input className="input-field mt-1" onChange={(event) => updateVariant(index, "color", event.target.value)} value={variant.color} /></label><label className="text-xs font-bold">Size<input className="input-field mt-1" onChange={(event) => updateVariant(index, "size", event.target.value)} value={variant.size} /></label><label className="text-xs font-bold">Price (paisa)<input className="input-field mt-1" min="1" onChange={(event) => updateVariant(index, "price", Number(event.target.value))} required type="number" value={variant.price || ""} /></label><label className="text-xs font-bold">Compare-at (paisa)<input className="input-field mt-1" min="1" onChange={(event) => updateVariant(index, "compareAtPrice", event.target.value ? Number(event.target.value) : null)} type="number" value={variant.compareAtPrice ?? ""} /></label><label className="text-xs font-bold">Cost (paisa)<input className="input-field mt-1" min="1" onChange={(event) => updateVariant(index, "costPrice", event.target.value ? Number(event.target.value) : null)} type="number" value={variant.costPrice ?? ""} /></label><label className="text-xs font-bold">{variant.id ? "On hand" : "Opening stock"}<input className="input-field mt-1 disabled:bg-black/5" disabled={Boolean(variant.id)} min="0" onChange={(event) => updateVariant(index, "stock", Number(event.target.value))} type="number" value={variant.stock} /></label><label className="text-xs font-bold">Reorder level<input className="input-field mt-1" min="0" onChange={(event) => updateVariant(index, "reorderLevel", Number(event.target.value))} type="number" value={variant.reorderLevel} /></label></div><label className="mt-3 flex items-center gap-2 text-xs font-bold"><input checked={variant.isActive} onChange={(event) => updateVariant(index, "isActive", event.target.checked)} type="checkbox" /> Available for sale</label></article>)}</div></section><div className="flex justify-end"><button className="button-primary" disabled={pending} type="submit">{pending ? "Saving…" : "Save product"}</button></div>
  </form>;
}
