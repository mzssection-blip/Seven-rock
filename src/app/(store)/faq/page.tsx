import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "FAQ", alternates: { canonical: "/faq" } };

export default function FaqPage() {
  return (
    <InfoPage eyebrow="Information — 04 / Answers" title="FAQ.">
      <InfoSection title="Do I need an account to order?">
        <p>No — guest checkout is fully supported. An account lets you track orders and save addresses.</p>
      </InfoSection>
      <InfoSection title="How do I pay?">
        <p>Cash on Delivery is available in every active zone. bKash, Nagad and online payment will switch on once merchant credentials are configured — we never simulate payments.</p>
      </InfoSection>
      <InfoSection title="When is my order confirmed?">
        <p>We call to confirm every order before dispatch. If we cannot reach you within 48 hours, the order is released back to inventory.</p>
      </InfoSection>
      <InfoSection title="Are stock counts real?">
        <p>Yes. Every product page and the cart check live inventory reserved against real stock. If something shows sold out, it is genuinely sold out.</p>
      </InfoSection>
      <InfoSection title="Do prices ever differ at checkout?">
        <p>No. The price you see on a product or in your bag is recalculated and verified server-side at checkout — never trusted from the browser.</p>
      </InfoSection>
    </InfoPage>
  );
}
