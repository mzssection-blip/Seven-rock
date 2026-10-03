import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Returns", alternates: { canonical: "/returns" } };

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Information — 02 / Policy"
      title="Returns."
      intro="Straightforward exchanges and refunds, decided by real people — not bots."
    >
      <InfoSection title="7-day window">
        <p>You may request a return within 7 days of receiving your order. Items must be unworn, unwashed and in original packaging with tags attached.</p>
      </InfoSection>
      <InfoSection title="How to request">
        <p>Contact us with your order number (found in your confirmation call or account order history) and the reason for the return. We will arrange a pickup or exchange point.</p>
      </InfoSection>
      <InfoSection title="Refunds">
        <p>COD orders are refunded via bKash, Nagad or bank transfer once the returned item passes inspection. Refunds are processed within 3–5 working days of receiving the item.</p>
      </InfoSection>
      <InfoSection title="Not eligible">
        <p>Items marked as final sale at checkout, and items showing signs of wear, washing or alteration, cannot be returned.</p>
      </InfoSection>
    </InfoPage>
  );
}
