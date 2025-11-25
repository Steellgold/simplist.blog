import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
// import { Button } from "@simplist/ui/components/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card";
// import { Check } from "lucide-react";
// import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Simplist",
  description: "Simple, transparent pricing for Simplist content management API",
};

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />

      <p>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ut architecto repellat libero quod. Necessitatibus aspernatur earum ea enim autem ipsam quas accusamus. Nesciunt asperiores omnis ex laudantium beatae quia facilis? Enim veritatis, repellat quidem dolorem ratione excepturi magnam ea expedita, accusantium doloremque eum amet pariatur adipisci quam ab eius vitae eos fugit veniam? Porro quidem explicabo veritatis ex nisi minus sequi perspiciatis quae suscipit doloremque. Quaerat, facilis.
      </p>

      <Footer />
    </div>
  );
};

export default PricingPage;
