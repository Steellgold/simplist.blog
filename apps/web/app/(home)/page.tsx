import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ApiDemoSection } from "./_sections/api-demo-section";
import { FeaturesSection } from "./_sections/features-section";
import { HeroSection } from "./_sections/hero-section";
import { LightRays } from "@simplist/ui/components/shared/light-rays";

const HomePage = async () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <LightRays count={16} color="rgba(240, 187, 59, 0.3)" blur={60} speed={10} length="80vh" />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ApiDemoSection />
      <Footer />
    </div>
  );
};

export default HomePage;