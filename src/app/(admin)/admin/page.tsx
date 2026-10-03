import Link from "next/link";
import { AlertTriangle, ArrowRight, PackageCheck, ShoppingBag, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate, formatMoney } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [pendingOrders, activeProducts, deliveredRevenue, recentOrders, inventory] = await Promise.all([
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "PACKED"] } } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.order.aggregate({ where: { status: "DELIVERED" }, _sum: { total: true } }),
    db.order.findMany({ include: { items: true }, orderBy: { placedAt: "desc" }, take: 6 }),
    db.inventoryItem.findMany({ include: { variant: { include: { product: { select: { name: true } } } } }, orderBy: { updatedAt: "desc" }, take: 100 }),
  ]);
  const lowStock = inventory.filter((item) => item.onHand - item.reserved <= item.reorderLevel).slice(0, 6);
  const stats = [
    { label: "Open orders", value: pendingOrders.toString(), href: "/admin/orders", icon: ShoppingBag },
    { label: "Active products", value: activeProducts.toString(), href: "/admin/products", icon: PackageCheck },
    { label: "Delivered revenue", value: formatMoney(deliveredRevenue._sum.total ?? 0), href: "/admin/orders", icon: Wallet },
  ];

  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Operations</p><h1 className="display-title mt-1 text-5xl">Overview</h1></div><Link className="button-primary" href="/admin/products/new">Add product</Link></div><section className="mt-8 grid gap-4 md:grid-cols-3">{stats.map(({ label, value, href, icon: Icon }) => <Link className="surface group p-5 transition hover:border-[#cb5a2e]" href={href} key={label}><div className="flex items-start justify-between"><Icon className="text-[#cb5a2e]" size={20} /><ArrowRight className="transition group-hover:translate-x-1" size={17} /></div><p className="mt-7 text-sm text-[#6e675e]">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight">{value}</p></Link>)}</section><div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.6fr)]"><section className="surface p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Fulfilment</p><h2 className="display-title mt-1 text-3xl">Recent orders</h2></div><Link className="text-sm font-bold underline" href="/admin/orders">All orders</Link></div>{recentOrders.length ? <div className="mt-5 divide-y divide-black/10">{recentOrders.map((order) => <Link className="flex flex-wrap items-center justify-between gap-3 py-4 hover:text-[#cb5a2e]" href={`/admin/orders/${order.id}`} key={order.id}><div><p className="font-bold">{order.number}</p><p className="mt-1 text-xs text-[#6e675e]">{formatDate(order.placedAt)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p></div><div className="text-right"><p className="text-xs font-bold">{order.status}</p><p className="mt-1 text-sm font-bold">{formatMoney(order.total)}</p></div></Link>)}</div> : <p className="mt-5 text-sm text-[#6e675e]">No orders have been placed.</p>}</section><section className="surface p-5"><div className="flex items-center justify-between"><div><p className="eyebrow">Attention</p><h2 className="display-title mt-1 text-3xl">Low stock</h2></div><AlertTriangle className="text-[#cb5a2e]" size={20} /></div>{lowStock.length ? <div className="mt-5 space-y-3">{lowStock.map((item) => <Link className="block border-b border-black/10 pb-3 text-sm hover:text-[#cb5a2e]" href="/admin/inventory" key={item.id}><p className="font-bold">{item.variant.product.name}</p><p className="mt-1 text-xs text-[#6e675e]">{item.variant.sku} · {item.onHand - item.reserved} available / alert at {item.reorderLevel}</p></Link>)}</div> : <p className="mt-5 text-sm text-[#6e675e]">Stock levels are healthy.</p>}</section></div></div>;
}
