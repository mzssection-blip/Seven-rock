import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Information — 05 / Contact"
      title="Contact."
      intro="Order support is handled personally — every order is confirmed by phone before dispatch."
    >
      <InfoSection title="Order support">
        <p>Reply to your order confirmation call, or reach us through the phone number provided when you placed your order. Keep your order number ready — it starts with SR.</p>
      </InfoSection>
      <InfoSection title="Studio">
        <p>SEVEN ROCK — Dhaka, Bangladesh. We operate online first; studio visits are by appointment only.</p>
      </InfoSection>
      <InfoSection title="Hours">
        <p>Saturday to Thursday, 10:00–19:00 (BST). Friday closed.</p>
      </InfoSection>
    </InfoPage>
  );
}
