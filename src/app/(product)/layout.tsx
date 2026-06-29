import { ProductLayout } from "@/shared/layouts/ProductLayout";

export default function ProductRouteGroupLayout({ children }: { children: React.ReactNode }) {
  return <ProductLayout>{children}</ProductLayout>;
}
