import { cn } from "@/shared/lib/cn";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/72 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="w-full max-w-lg rounded-lg border border-white/12 bg-[#080d09] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-xl font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-md border border-white/12 px-3 py-1 text-sm text-white/68 hover:text-white">Close</button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export function ModalPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md bg-white/[0.04] p-4", className)} {...props} />;
}
