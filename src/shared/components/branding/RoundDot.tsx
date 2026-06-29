export function RoundDot({ className = "" }: { className?: string }) {
  return (
    <>
      <span className="sr-only">.</span>
      <span aria-hidden="true" className={`inline-block h-[0.12em] w-[0.12em] rounded-full bg-current align-[0.03em] ${className}`} />
    </>
  );
}
