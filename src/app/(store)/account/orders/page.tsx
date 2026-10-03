import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDate, formatMoney } from "@/lib/format";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const orders = await db.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { placedAt: "desc" } });
  return (
    <div className="page-shell py-12 sm:py-16">
      <Link className="meta !text-mist hover:!text-paper" href="/account">← Account</Link>
      <h1 className="display-title mt-3 text-5xl sm:text-6xl">Orders.</h1>
      {!orders.length ? (
        <div className="mt-10 border border-white/10 p-8">
          <p className="font-semibold text-paper">No orders yet.</p>
          <Link className="link-line mt-4 inline-block text-sm text-paper" href="/shop">Shop the collection</Link>
        </div>
      ) : (
        <div className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {orders.map((order, index) => (
            <article className="py-6" key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-paper">{String(index + 1).padStart(2, "0")} — {order.number}</p>
                  <p className="meta mt-1.5 !text-mist/70">{formatDate(order.placedAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p>
                </div>
                <div className="text-right">
                  <span className="meta inline-block border border-white/15 px-2 py-1">{order.status}</span>
                  <p className="mt-2 font-semibold text-paper">{formatMoney(order.total)}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-mist">
                {order.items.map((item) => <li key={item.id}>{item.productName} · {item.quantity} × {formatMoney(item.unitPrice)}</li>)}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
