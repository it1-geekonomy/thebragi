import { cn } from "@/shared/lib/cn";

export function Accordion({ items }: { items: Array<{ title: string; content: React.ReactNode }> }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details key={item.title} className="group rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <summary className="cursor-pointer list-none font-semibold text-white">
            <span className="flex items-center justify-between gap-4">
              {item.title}
              <span className="text-[#7dc890] group-open:rotate-45">+</span>
            </span>
          </summary>
          <div className="mt-3 text-sm leading-6 text-white/60">{item.content}</div>
        </details>
      ))}
    </div>
  );
}

export function AccordionPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-white/10", className)} {...props} />;
}
