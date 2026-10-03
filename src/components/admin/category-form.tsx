"use client";

import { useActionState } from "react";
import { saveCategoryAction, type AdminActionState } from "@/app/actions/admin";

type CategoryFormProps = {
  categories: { id: string; name: string }[];
  category?: { id: string; name: string; slug: string; description: string | null; imageUrl: string | null; parentId: string | null; sortOrder: number; isVisible: boolean };
};

export function CategoryForm({ categories, category }: CategoryFormProps) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(saveCategoryAction, undefined);
  return <form action={action} className="grid gap-3 border border-black/10 p-4"><input name="id" type="hidden" value={category?.id ?? ""} /><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Name<input className="input-field mt-1" defaultValue={category?.name} name="name" required /></label><label className="text-xs font-bold">Slug<input className="input-field mt-1" defaultValue={category?.slug} name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label className="text-xs font-bold">Parent<select className="input-field mt-1" defaultValue={category?.parentId ?? ""} name="parentId"><option value="">No parent</option>{categories.filter((item) => item.id !== category?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs font-bold">Sort order<input className="input-field mt-1" defaultValue={category?.sortOrder ?? 0} min="0" name="sortOrder" type="number" /></label></div><label className="text-xs font-bold">Description<textarea className="input-field mt-1 min-h-20" defaultValue={category?.description ?? ""} name="description" /></label><label className="text-xs font-bold">Image URL<input className="input-field mt-1" defaultValue={category?.imageUrl ?? ""} name="imageUrl" type="url" /></label><div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-xs font-bold"><input defaultChecked={category?.isVisible ?? true} name="isVisible" type="checkbox" /> Visible in navigation</label><button className="button-primary px-4 py-2" disabled={pending} type="submit">{pending ? "Saving…" : category ? "Save category" : "Create category"}</button></div>{state?.error && <p className="text-sm text-red-700">{state.error}</p>}{state?.success && <p className="text-sm text-emerald-700">{state.success}</p>}</form>;
}
