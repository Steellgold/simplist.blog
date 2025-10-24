import Footer from "@/components/layout/footer";
import { HomeHeader } from "@/components/layout/home-header";
import { ApiDemoSection } from "./_sections/api-demo-section";
import { FeaturesSection } from "./_sections/features-section";
import { HeroSection } from "./_sections/hero-section";

const HomePage = async () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <HomeHeader />
      <HeroSection />
      <FeaturesSection />
      <ApiDemoSection />
      <Footer />
    </div>
  );
};

export default HomePage;