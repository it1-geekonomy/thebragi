import Link from "next/link";

export function DropdownMenu({ label, items }: { label: string; items: Array<{ label: string; href: string; description?: string }> }) {
  return (
    <div className="group relative">
      <button type="button" className="py-5 text-white/72 transition hover:text-white">{label}</button>
      <div className="invisible absolute left-0 top-12 w-72 rounded-lg border border-white/10 bg-[#081008] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
        {items.map((item) => (
          <Link key={item.href} className="block rounded-md px-3 py-3 hover:bg-white/8" href={item.href}>
            <span className="block text-sm font-semibold text-white/86">{item.label}</span>
            {item.description ? <span className="mt-1 block text-xs leading-5 text-white/44">{item.description}</span> : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
