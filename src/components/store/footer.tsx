import Link from "next/link";
import { Reveal } from "@/components/store/reveal";

const columns = [
  {
    title: "Shop",
    links: [["Shop all", "/shop"], ["New drop", "/shop?sort=newest"], ["Sale", "/sale"], ["Collections", "/#edit"]],
  },
  {
    title: "Customer care",
    links: [["Shipping", "/shipping"], ["Returns", "/returns"], ["Size guide", "/size-guide"], ["FAQ", "/faq"], ["Contact", "/contact"]],
  },
  {
    title: "Company",
    links: [["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Account", "/account"]],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="page-shell">
        <Reveal>
          <p aria-hidden className="display-wide select-none pt-10 text-[17vw] font-extrabold uppercase leading-[0.8] text-white/[0.06] lg:pt-16">
            Seven Rock
          </p>
        </Reveal>

        <div className="grid gap-10 border-t border-white/10 py-12 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr] lg:gap-8">
          <div>
            <p className="wordmark text-xl">SEVEN ROCK</p>
            <p className="mt-4 max-w-xs text-sm leading-6 text-mist">
              Modern essentials for the move. Built in Dhaka, Bangladesh for everyday expression.
            </p>
            <div className="meta mt-6 space-y-1.5 !text-mist/70">
              <p>DHAKA — BANGLADESH</p>
              <p>EST. 2026 — ALL PRICES IN BDT</p>
              <p className="text-rust">CASH ON DELIVERY NATIONWIDE</p>
            </div>
          </div>

          {columns.map((column, index) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="meta !text-mist/60">{String(index + 1).padStart(2, "0")} / {column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map(([label, href]) => (
                  <li key={`${column.title}-${href}`}>
                    <Link className="link-line text-sm text-paper/85" href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-5 text-[10px] uppercase tracking-[0.2em] text-mist/50 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} SEVEN ROCK — All rights reserved</span>
          <span>Seven Rock / 2026 — Collection 01</span>
        </div>
      </div>
    </footer>
  );
}
