"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function BackButton({ className, fallback = "/" }: { className?: string; fallback?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // If there is history and the previous page was on the same domain, go back safely
    if (window.history.length > 1 && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      // Otherwise fallback to a default route (like home) so we don't exit the app
      router.push(fallback);
    }
  };

  return (
    <button
      onClick={handleBack}
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
