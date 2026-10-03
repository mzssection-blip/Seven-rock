import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Information — 08 / Legal"
      title="Terms."
      intro="The plain-language terms of shopping with SEVEN ROCK."
    >
      <InfoSection title="Orders">
        <p>An order is a request to purchase. It becomes binding when we confirm it by phone. Prices are calculated server-side at checkout; displayed prices in the bag are indicative until verified.</p>
      </InfoSection>
      <InfoSection title="Stock">
        <p>Inventory is live and shared across concurrent shoppers. In the rare case an item becomes unavailable after ordering, we offer a refund or an equivalent exchange.</p>
      </InfoSection>
      <InfoSection title="Coupons">
        <p>Promo codes are validated server-side against their live terms (minimum order, expiry, usage limits) before any discount is applied to an order.</p>
      </InfoSection>
      <InfoSection title="Delivery">
        <p>Fees follow our active delivery zones and are shown at checkout. Delivery timelines are estimates, not guarantees.</p>
      </InfoSection>
      <InfoSection title="Returns">
        <p>Our 7-day return policy applies as described on the returns page.</p>
      </InfoSection>
    </InfoPage>
  );
}
