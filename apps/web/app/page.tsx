import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { LightRays } from "@simplist/ui/components/shared/light-rays";
import { ApiDemoSection } from "./_sections/api-demo-section";
import { FeaturesSection } from "./_sections/features-section";
import { HeroSection } from "./_sections/hero-section";
import { PricingSection } from "./_sections/pricing-section";

const HomePage = async () => {
  return (
    <div className="relative min-h-screen">
      <div className="from-background via-background to-secondary/20 fixed inset-0 bg-linear-to-br" />
      <LightRays
        count={8}
        color="rgba(240, 187, 59, 0.3)"
        blur={100}
        speed={10}
        length="30vh"
        className="fixed inset-0 z-0"
      />

      <div className="relative z-10">
        <Navbar />

        <SectionWrapper>
          <HeroSection />
        </SectionWrapper>

        <SectionWrapper variant="accent">
          <FeaturesSection />
        </SectionWrapper>

        <SectionWrapper>
          <PricingSection />
        </SectionWrapper>

        <SectionWrapper variant="accent">
          <ApiDemoSection />
        </SectionWrapper>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
