import { Card } from "@/shared/components/ui/Card";

export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Card className="p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {children ? <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/58">{children}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
