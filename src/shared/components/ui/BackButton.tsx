"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "group flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white",
        className
      )}
      aria-label="Go back"
    >
      <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      Back
    </button>
  );
}
