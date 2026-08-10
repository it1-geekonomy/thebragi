import { MarketingNavbar } from "@/shared/components/layout/MarketingNavbar";

export function CommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050705] text-white">
      <MarketingNavbar />
      {children}
    </div>
  );
}
