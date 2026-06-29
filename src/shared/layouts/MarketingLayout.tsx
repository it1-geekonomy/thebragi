import { MarketingFooter } from "@/shared/components/layout/MarketingFooter";
import { MarketingNavbar } from "@/shared/components/layout/MarketingNavbar";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <MarketingNavbar />
      {children}
      <MarketingFooter />
    </div>
  );
}
