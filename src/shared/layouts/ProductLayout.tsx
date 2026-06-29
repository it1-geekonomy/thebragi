import { ProductShell } from "@/shared/components/layout/ProductShell";

export function ProductLayout({ children }: { children: React.ReactNode }) {
  return <ProductShell>{children}</ProductShell>;
}
