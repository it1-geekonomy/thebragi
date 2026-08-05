"use client";

import { cn } from "@/shared/lib/cn";

export type PaymentMethod = "card" | "upi" | "netbanking" | "neft";

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "card", label: "Card" },
  { id: "upi", label: "UPI" },
  { id: "netbanking", label: "Net Banking" },
  { id: "neft", label: "NEFT / Bank transfer" },
];

export function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-white/72">Payment method</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {METHODS.map((method) => {
          const selected = value === method.id;
          return (
            <button
              key={method.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(method.id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-semibold transition",
                selected
                  ? "border-[#7dc890] bg-[#7dc890]/16 text-white"
                  : "border-white/12 bg-black/35 text-white/62 hover:border-white/24 hover:text-white",
              )}
            >
              {selected ? <span className="h-1.5 w-1.5 rounded-full bg-[#7dc890]" aria-hidden /> : null}
              {method.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
