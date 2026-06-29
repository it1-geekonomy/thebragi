import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";

export function CommerceHeader() {
  return (
    <header className="border-b border-white/10 bg-black px-5 py-5 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href={ROUTES.home}><BragiLogo /></Link>
        <Link className="text-sm font-semibold text-white/64 hover:text-white" href={ROUTES.pricing}>Change plan</Link>
      </div>
    </header>
  );
}
