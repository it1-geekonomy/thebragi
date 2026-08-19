import { cn } from "@/shared/lib/cn";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full h-12 appearance-none rounded-md border border-white/15 bg-[#111a13] px-4 pr-10 text-[16px] text-white outline-none [color-scheme:dark] focus:border-[#7dc890] focus:ring-2 focus:ring-[#7dc890]/25",
          className,
        )}
        {...props}
      />
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#7dc890]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
    </div>
  );
}
