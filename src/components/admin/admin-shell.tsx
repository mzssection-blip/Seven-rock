import Link from "next/link";
import { Boxes, LayoutDashboard, LogOut, Package, Settings, ShoppingBag, Tags, Ticket, Users } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type AdminShellProps = {
  user: { name: string; email: string };
  children: React.ReactNode;
};

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ user, children }: AdminShellProps) {
  return <div className="min-h-screen bg-[#f8f6f1] text-[#171512]"><header className="border-b border-black/10 bg-white"><div className="page-shell flex min-h-16 items-center justify-between gap-4"><Link className="font-serif text-2xl font-bold tracking-[-0.08em]" href="/admin">SEVEN ROCK <span className="font-sans text-[10px] tracking-[0.16em] text-[#cb5a2e]">ADMIN</span></Link><div className="flex items-center gap-3 text-right"><div className="hidden sm:block"><p className="text-sm font-bold">{user.name}</p><p className="text-xs text-[#6e675e]">{user.email}</p></div><form action={logoutAction}><button aria-label="Sign out" className="rounded-full border border-black/10 p-2.5 hover:bg-black hover:text-white" type="submit"><LogOut size={16} /></button></form></div></div></header><div className="page-shell grid gap-8 py-6 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="overflow-x-auto lg:overflow-visible"><nav className="flex min-w-max gap-2 lg:flex-col">{navigation.map(({ href, label, icon: Icon }) => <Link className="flex items-center gap-2 border border-black/10 bg-white px-3 py-2.5 text-sm font-bold transition hover:border-[#cb5a2e] hover:text-[#cb5a2e]" href={href} key={href}><Icon size={16} />{label}</Link>)}</nav></aside><main className="min-w-0 pb-10">{children}</main></div></div>;
}
