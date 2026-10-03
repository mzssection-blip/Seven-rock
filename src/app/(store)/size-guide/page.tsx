import type { Metadata } from "next";
import { InfoPage, InfoSection } from "@/components/store/info-page";

export const metadata: Metadata = { title: "Size guide", alternates: { canonical: "/size-guide" } };

const rows = [
  ["S", "38", "27", "40"],
  ["M", "40", "28", "42"],
  ["L", "42", "29", "44"],
  ["XL", "44", "30", "46"],
] as const;

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Information — 03 / Fit"
      title="Size guide."
      intro="Measurements in inches, taken flat. If you sit between sizes, we recommend sizing up for a relaxed fit."
    >
      <InfoSection title="Tops (inches)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-96 border border-white/10 text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {["Size", "Chest", "Length", "Shoulder"].map((heading) => (
                  <th className="meta p-3 !text-mist" key={heading}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map(([size, chest, length, shoulder]) => (
                <tr key={size}>
                  <td className="p-3 font-semibold text-paper">{size}</td>
                  <td className="p-3 text-mist">{chest}</td>
                  <td className="p-3 text-mist">{length}</td>
                  <td className="p-3 text-mist">{shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>
      <InfoSection title="How to measure">
        <p>Chest — measure around the fullest part, tape level under the arms. Length — from the highest shoulder point straight down. Shoulder — seam to seam across the back.</p>
      </InfoSection>
    </InfoPage>
  );
}
