import type { ReactNode } from "react";
import { Footer } from "@/components/store/footer";
import { Header } from "@/components/store/header";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <><Header /><main>{children}</main><Footer /></>;
}
