import { FeatureHighlightsSection } from "@/features/marketing/components/FeatureHighlightsSection";
import { HeroSection } from "@/features/marketing/components/HeroSection";
import { MetricsStrip } from "@/features/marketing/components/MetricsStrip";
import { PricingTeaserSection } from "@/features/marketing/components/PricingTeaserSection";
import { WaitlistSection } from "@/features/marketing/components/WaitlistSection";
import { MarketingLayout } from "@/shared/layouts/MarketingLayout";
import { AuthRedirector } from "@/features/auth/components/AuthRedirector";

export default function HomePage() {
  return (
    <MarketingLayout>
      <AuthRedirector />
      <main>
        <HeroSection />
        <MetricsStrip />
        <FeatureHighlightsSection />
        <PricingTeaserSection />
        <WaitlistSection />
      </main>
    </MarketingLayout>
  );
}
