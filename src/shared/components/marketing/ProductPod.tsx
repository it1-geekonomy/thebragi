import Link from "next/link";
import Image from "next/image";
import { Card } from "@/shared/components/ui/Card";
import { ROUTES } from "@/config/routes";

export function ProductPod({ product }: { product: { title: string; description: string; href: string; checkoutPlan: string; image: string } }) {
  return (
    <Card className="grid gap-5 overflow-hidden p-5">
      <div className="relative aspect-[16/10] rounded-md border border-white/10 bg-[#0f1711]">
        <Image src={product.image} alt="" fill className="object-contain p-8" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white">{product.title}</h3>
        <p className="mt-2 min-h-14 text-sm leading-6 text-white/60">{product.description}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="text-sm font-semibold text-[#a8dfb3] hover:text-white" href={product.href}>Learn more</Link>
        <Link className="text-sm font-semibold text-white/84 hover:text-white" href={ROUTES.checkout(product.checkoutPlan)}>Buy now</Link>
      </div>
    </Card>
  );
}
