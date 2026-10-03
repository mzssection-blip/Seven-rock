import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Information — 06 / The brand"
      title="Built for the next era."
      intro="SEVEN ROCK is a Dhaka-born fashion label making sharp, honest essentials for everyday expression."
    >
      <InfoSection title="The idea">
        <p>We cut the noise out of getting dressed. Fewer, better pieces — engineered fits, heavyweight fabrics and a palette that outlives trends. Designed to be worn hard and kept long.</p>
      </InfoSection>
      <InfoSection title="Made in Dhaka">
        <p>Every piece is produced locally in Bangladesh, close to the people who wear it. Short production runs keep quality tight and waste low.</p>
      </InfoSection>
      <InfoSection title="Straight dealing">
        <p>Live stock counts, server-verified prices, real delivery fees pulled from our zones and payments we never fake. What you see is exactly what ships.</p>
      </InfoSection>
    </InfoPage>
  );
}
