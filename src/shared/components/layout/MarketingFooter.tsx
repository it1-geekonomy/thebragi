import Link from "next/link";
import { footerColumns } from "@/config/nav";
import { brand } from "@/config/brand";
import { BragiLogo } from "@/shared/components/branding/BragiLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-12 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <BragiLogo />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/52">Sales, projects, and the work between them in one Bragi workspace.</p>
          <p className="mt-6 text-sm text-white/38">2026 Bragi | Built by Geekonomy</p>
        </div>
        <div className="grid grid-cols-2 gap-7 sm:grid-cols-4">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">{column.title}</h3>
              <ul className="mt-4 grid gap-3 text-sm text-white/54">
                {column.links.map((link) => <li key={link.href}><Link className="hover:text-white" href={link.href}>{link.label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-sm text-white/42">
        <a className="hover:text-white" href={`mailto:${brand.email}`}>{brand.email}</a>
      </div>
    </footer>
  );
}
