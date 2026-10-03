import { CouponForm } from "@/components/admin/coupon-form";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";

function dateInput(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({ include: { productLinks: true, categoryLinks: true, _count: { select: { redemptions: true } } }, orderBy: { updatedAt: "desc" } });
  return <div><div><p className="eyebrow">Promotions</p><h1 className="display-title mt-1 text-5xl">Coupons</h1><p className="mt-3 text-sm text-[#6e675e]">Money amounts are stored in paisa; use fixed coupons for an exact BDT amount.</p></div><section className="surface mt-8 p-5"><p className="mb-4 text-sm font-bold">Create coupon</p><CouponForm /></section><div className="mt-8 space-y-4">{coupons.map((coupon) => <details className="surface" key={coupon.id}><summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-bold">{coupon.code}</p><p className="mt-1 text-xs text-[#6e675e]">{coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `${coupon.value} paisa off`} · {coupon._count.redemptions} redemption{coupon._count.redemptions === 1 ? "" : "s"}</p></div><div className="text-right"><span className="bg-[#e8e3da] px-2 py-1 text-[10px] font-bold tracking-wide">{coupon.isActive ? "ACTIVE" : "INACTIVE"}</span><p className="mt-2 text-xs text-[#6e675e]">{coupon.expiresAt ? `Ends ${formatDate(coupon.expiresAt)}` : "No expiry"}</p></div></summary><div className="border-t border-black/10 p-5"><CouponForm coupon={{ id: coupon.id, code: coupon.code, type: coupon.type, value: coupon.value, minimumOrder: coupon.minimumOrder, maximumDiscount: coupon.maximumDiscount, startsAt: dateInput(coupon.startsAt), expiresAt: dateInput(coupon.expiresAt), usageLimit: coupon.usageLimit, perUserLimit: coupon.perUserLimit, isActive: coupon.isActive, productIds: coupon.productLinks.map((link) => link.productId), categoryIds: coupon.categoryLinks.map((link) => link.categoryId) }} /></div></details>)}</div></div>;
}
