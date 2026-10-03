"use client";

import { useActionState } from "react";
import { changeOrderStatusAction, type AdminActionState } from "@/app/actions/admin";

const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export function OrderStatusForm({ orderId, status }: { orderId: string; status: string }) {
  const [state, action, pending] = useActionState<AdminActionState, FormData>(changeOrderStatusAction, undefined);
  return <form action={action} className="grid gap-3 border border-black/10 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"><input name="orderId" type="hidden" value={orderId} /><label className="text-xs font-bold">New status<select className="input-field mt-1" defaultValue={status} name="status">{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-xs font-bold">Note<input className="input-field mt-1" maxLength={500} name="note" placeholder="Optional internal note" /></label><button className="button-primary self-end px-4 py-3" disabled={pending} type="submit">{pending ? "Updating…" : "Update"}</button>{state?.error && <p className="sm:col-span-3 text-sm text-red-700">{state.error}</p>}{state?.success && <p className="sm:col-span-3 text-sm text-emerald-700">{state.success}</p>}</form>;
}
