import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Information — 07 / Legal"
      title="Privacy."
      intro="We collect the minimum required to deliver your order — nothing more."
    >
      <InfoSection title="What we collect">
        <p>Name, phone, delivery address and (optionally) email for order fulfilment. Account users additionally have a hashed password and saved addresses.</p>
      </InfoSection>
      <InfoSection title="How it is used">
        <p>Only to process, confirm and deliver orders, and to contact you about them. Payment is cash on delivery — we never store card or wallet credentials.</p>
      </InfoSection>
      <InfoSection title="What we never do">
        <p>We do not sell your data, run third-party ad trackers or send marketing you did not ask for.</p>
      </InfoSection>
      <InfoSection title="Your control">
        <p>You can request deletion of your account and personal data at any time through contact support. Order records required for accounting are retained as legally required.</p>
      </InfoSection>
    </InfoPage>
  );
}
