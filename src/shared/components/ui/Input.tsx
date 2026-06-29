import { cn } from "@/shared/lib/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: InputProps) {
  return (
    <label className="block text-sm text-white/72" htmlFor={id}>
      {label ? <span className="mb-2 block font-medium">{label}</span> : null}
      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-md border border-white/12 bg-black/35 px-4 text-base text-white outline-none transition focus:border-[#7dc890]",
          error && "border-red-400/70",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
