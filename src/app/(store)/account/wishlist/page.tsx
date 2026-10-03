import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductGrid } from "@/components/store/product-grid";
import { db } from "@/lib/db";
import { productCardInclude } from "@/modules/catalog/catalog.service";
import { getCurrentUser } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const saved = await db.wishlistItem.findMany({ where: { userId: user.id, product: { status: "ACTIVE" } }, include: { product: { include: productCardInclude } }, orderBy: { createdAt: "desc" } });
  return (
    <div className="page-shell py-12 sm:py-16">
      <Link className="meta !text-mist hover:!text-paper" href="/account">← Account</Link>
      <h1 className="display-title mt-3 text-5xl sm:text-6xl">Wishlist.</h1>
      <div className="mt-10">
        {saved.length ? <ProductGrid eagerCount={2} products={saved.map((item) => item.product)} /> : (
          <div className="border border-white/10 p-8">
            <p className="font-semibold text-paper">Your wishlist is empty.</p>
            <Link className="link-line mt-4 inline-block text-sm text-paper" href="/shop">Discover new pieces</Link>
          </div>
        )}
      </div>
    </div>
  );
}
