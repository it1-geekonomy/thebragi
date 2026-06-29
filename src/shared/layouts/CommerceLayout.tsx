import { CommerceHeader } from "@/shared/components/layout/CommerceHeader";

export function CommerceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050705] text-white">
      <CommerceHeader />
      {children}
    </div>
  );
}
