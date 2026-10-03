"use client";

import { useActionState } from "react";
import { adjustInventoryAction, type AdminActionState } from "@/app/actions/admin";

export function InventoryAdjustmentForm({ inventoryItemId }: { inventoryItemId: string }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(adjustInventoryAction, undefined);
  return <form action={action} className="mt-3 grid gap-2 border-t border-black/10 pt-3 sm:grid-cols-[100px_minmax(0,1fr)_auto]"><input name="inventoryItemId" type="hidden" value={inventoryItemId} /><label className="text-xs font-bold">Delta<input className="input-field mt-1" name="quantityDelta" placeholder="+10 / -2" required type="number" /></label><label className="text-xs font-bold">Reason<input className="input-field mt-1" maxLength={500} name="note" placeholder="Stock count or supplier receipt" required /></label><button className="button-secondary self-end px-3 py-3" disabled={pending} type="submit">{pending ? "Saving…" : "Adjust"}</button>{state?.error && <p className="sm:col-span-3 text-sm text-red-700">{state.error}</p>}{state?.success && <p className="sm:col-span-3 text-sm text-emerald-700">{state.success}</p>}</form>;
}
