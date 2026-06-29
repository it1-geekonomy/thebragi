import { products } from "@/config/products";
import { ProductPod } from "@/shared/components/marketing/ProductPod";
import { SectionHeading } from "@/shared/components/marketing/SectionHeading";

export function ProductPodsSection() {
  return (
    <section className="bg-black px-5 py-16 sm:px-8 lg:px-10">
      <SectionHeading eyebrow="Products" title="Pick the workspace your team needs first">
        Start with sales, delivery, or the complete operating layer when both sides need to move together.
      </SectionHeading>
      <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-3">
        {Object.values(products).map((product) => <ProductPod key={product.key} product={product} />)}
      </div>
    </section>
  );
}
