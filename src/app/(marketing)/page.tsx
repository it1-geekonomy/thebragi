import { FeatureHighlightsSection } from "@/features/marketing/components/FeatureHighlightsSection";
import { HeroSection } from "@/features/marketing/components/HeroSection";
import { MetricsStrip } from "@/features/marketing/components/MetricsStrip";
import { PricingTeaserSection } from "@/features/marketing/components/PricingTeaserSection";
import { ProductPodsSection } from "@/features/marketing/components/ProductPodsSection";
import { WaitlistSection } from "@/features/marketing/components/WaitlistSection";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";

export default function HomePage() {
  return (
    <MarketingLayout>
      <main>
        <HeroSection />
        <MetricsStrip />
        <ProductPodsSection />
        <FeatureHighlightsSection />
        <PricingTeaserSection />
        <WaitlistSection />
      </main>
    </MarketingLayout>
  );
}
