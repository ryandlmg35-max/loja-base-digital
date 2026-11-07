import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TopNav />
      <div className="container site-container">{children}</div>
      <SiteFooter />
    </>
  );
}
