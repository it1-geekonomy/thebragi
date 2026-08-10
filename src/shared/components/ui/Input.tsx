"use client";

import { cn } from "@/shared/lib/cn";
import { useState } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, id, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block text-sm text-white/72" htmlFor={id}>
      {label ? <span className="mb-2 block font-medium">{label}</span> : null}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={cn(
            "h-12 w-full rounded-md border border-white/12 bg-black/35 px-4 text-base text-white outline-none transition focus:border-[#7dc890]",
            isPassword && "pr-12",
            error && "border-red-400/70",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword(!showPassword);
            }}
            tabIndex={-1}
            className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-white/50 hover:text-white transition"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.529l-.22.512-.347.7-1.42 2.384m-4.834 3.393A10.694 10.694 0 0 1 12 19c-5.523 0-10-4.477-10-10a10.687 10.687 0 0 1 3.565-7.989m2.766 12.392A3 3 0 0 1 8.56 9.53m2.748-2.73A3 3 0 0 1 14.47 9.56" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
