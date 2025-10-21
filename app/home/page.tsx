import Footer from "@/components/footer";
import { HomeHeader } from "@/components/home-header";
import { getCurrentUser } from "@/lib/auth-helper";
import { ApiDemoSection } from "./_sections/api-demo-section";
import { FeaturesSection } from "./_sections/features-section";
import { HeroSection } from "./_sections/hero-section";

const HomePage = async () => {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <HomeHeader user={user} />
      <HeroSection />
      <FeaturesSection />
      <ApiDemoSection />
      <Footer />
    </div>
  );
};

export default HomePage;
