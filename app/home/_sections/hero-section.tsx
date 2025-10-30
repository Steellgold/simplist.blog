import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="py-[148px] px-4">
      <div className="container max-w-4xl mx-auto text-center">
        <Badge variant="secondary" className="mb-4 motion-preset-fade motion-delay-[200ms]">
          Simple Content Management API
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 motion-preset-slide-up motion-delay-[400ms]">
          Where simplicity meets powerful content management
        </h1>

        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto motion-preset-fade motion-delay-[600ms]">
          Simplist is a simple, fast content management API. Post your content in the simplest way possible, and just get your content back with an API.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 justify-center motion-preset-slide-up motion-delay-[800ms]">
          <Button size="lg" asChild>
            <Link href="/auth/register">
              Start Building <ArrowRight />
            </Link>
          </Button>

          <Button size="lg" variant="outline" asChild>
            <Link href="#demo">
              View Demo
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
