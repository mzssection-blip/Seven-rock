import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <div className="page-shell py-12 sm:py-16">
      <p className="meta !text-mist">My SEVEN ROCK</p>
      <h1 className="display-title mt-3 text-5xl sm:text-6xl">Hello, {user.name.split(" ")[0]}.</h1>
      <div className="mt-10 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
        <Link className="group bg-ink p-6 transition hover:bg-graphite" href="/account/orders">
          <p className="meta !text-mist/60">01</p>
          <p className="mt-3 text-lg font-semibold text-paper group-hover:text-rust">Orders</p>
          <p className="mt-2 text-sm text-mist">Track status and view past purchases.</p>
        </Link>
        <Link className="group bg-ink p-6 transition hover:bg-graphite" href="/account/wishlist">
          <p className="meta !text-mist/60">02</p>
          <p className="mt-3 text-lg font-semibold text-paper group-hover:text-rust">Wishlist</p>
          <p className="mt-2 text-sm text-mist">Save pieces for later.</p>
        </Link>
        <div className="bg-ink p-6">
          <p className="meta !text-mist/60">03 / Profile</p>
          <dl className="mt-3 space-y-1.5 text-sm text-mist">
            <div className="flex justify-between gap-3"><dt>Email</dt><dd className="truncate text-paper">{user.email}</dd></div>
            {user.phone && <div className="flex justify-between gap-3"><dt>Phone</dt><dd className="text-paper">{user.phone}</dd></div>}
          </dl>
          <form action={logoutAction}><button className="link-line mt-5 text-sm text-paper" type="submit">Sign out</button></form>
        </div>
      </div>
    </div>
  );
}
