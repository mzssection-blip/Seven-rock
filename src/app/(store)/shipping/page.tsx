import type { Metadata } from "next";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/format";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Shipping", alternates: { canonical: "/shipping" } };

export default async function ShippingPage() {
  const zones = await db.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { baseFee: "asc" }],
    select: { name: true, type: true, baseFee: true, freeShippingOver: true, isCodEnabled: true },
  });

  return (
    <InfoPage
      eyebrow="Information — 01 / Logistics"
      title="Shipping."
      intro="Delivery fees are configured per live zone and verified against your exact delivery area at checkout. Fees below are pulled directly from our active delivery zones."
    >
      <InfoSection title="Delivery zones">
        <div className="divide-y divide-white/10 border border-white/10">
          {zones.map((zone) => (
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm" key={zone.name}>
              <div>
                <p className="font-semibold text-paper">{zone.name}</p>
                <p className="meta mt-1 !text-mist/60">{zone.type === "DHAKA" ? "Inside Dhaka" : "Outside Dhaka"}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-paper">{formatMoney(zone.baseFee)}</p>
                <p className="meta mt-1 !text-mist/60">{zone.freeShippingOver ? `Free over ${formatMoney(zone.freeShippingOver)}` : "No free threshold"}</p>
              </div>
            </div>
          ))}
        </div>
      </InfoSection>

      <InfoSection title="Timeline">
        <p>Inside Dhaka: 1–2 working days. Outside Dhaka: 2–4 working days. Orders are confirmed by phone before dispatch.</p>
      </InfoSection>

      <InfoSection title="Cash on delivery">
        <p>COD is available {zones.every((zone) => zone.isCodEnabled) ? "in every active zone" : "in selected zones"}. Pay the courier in cash when your order arrives.</p>
      </InfoSection>
    </InfoPage>
  );
}
