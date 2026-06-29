"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";

export function Tabs({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) {
  const [active, setActive] = useState(0);
  const current = tabs[active];

  return (
    <div>
      <div className="inline-flex rounded-md border border-white/10 bg-white/[0.04] p-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "rounded px-4 py-2 text-sm font-semibold transition",
              active === index ? "bg-[#5f9965] text-white" : "text-white/58 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-5">{current.content}</div>
    </div>
  );
}
