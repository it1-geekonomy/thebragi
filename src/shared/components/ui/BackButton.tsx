"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export function BackButton({ className, fallback = "/" }: { className?: string; fallback?: string }) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // History length starts at 1 (Safari) or 2 (Chrome new tab).
    // If > 2, there is definitely history in this tab.
    // If === 2, check if they came from our own site.
    const hasHistory = window.history.length > 2 || (window.history.length === 2 && document.referrer.includes(window.location.host));
    setCanGoBack(hasHistory);
  }, []);

  const handleBack = () => {
    if (canGoBack) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  if (!canGoBack) {
    return null;
  }

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
