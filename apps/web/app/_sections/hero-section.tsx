import { buttonVariants } from "@simplist/ui/components/button";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative py-12 lg:py-24 md:py-32 px-4">
      <div className="container max-w-6xl mx-auto grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        <div className="space-y-8 text-center lg:text-left">
          <div className="h-0 lg:h-13" />

          <div className="space-y-4">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight motion-preset-slide-up motion-delay-[300ms]"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Ship content
              <span className="text-primary"> like you ship code</span>.
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 motion-preset-fade motion-delay-[450ms]">
              Simplist is a headless CMS designed for developers who live in Git and ship with APIs.
              Create, version and deliver articles with a single, blazing fast content API.
            </p>
          </div>

          <div className="space-y-2 motion-preset-slide-up motion-delay-[600ms]">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className={buttonVariants({ variant: "default" })}
              >
                Start for free
                <ArrowRight />
              </Link>

              <Link
                href="#demo"
                className={buttonVariants({ variant: "outline" })}
              >
                <Play />
                Watch the API in action
              </Link>
            </div>

            <p className="text-xs text-muted-foreground text-center lg:text-left lg:mt-2">
              No credit card. Ship your first article in minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs text-muted-foreground motion-preset-fade motion-delay-[750ms]">
            <div className="flex items-center gap-2">
              <span className="h-1 w-3 rounded-full bg-emerald-700/60 dark:bg-emerald-400/60" />
              Built for Next.js, Remix, Astro & more
            </div>

            <span className="hidden md:inline text-border">•</span>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex h-5 items-center rounded-full bg-emerald-900/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 px-2">
                50ms
              </span>
              global p95 latency
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-8 rounded-3xl bg-linear-to-tr from-primary/15 via-primary/0 to-emerald-400/20 blur-3xl" />

          <div className="relative rounded-2xl border bg-card/80 backdrop-blur-sm p-5 shadow-xl shadow-primary/10 motion-preset-slide-left motion-delay-[400ms]">
            <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-700/80 dark:bg-emerald-400/80" />
                </span>
                TypeScript SDK
              </span>
              <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                Client example
              </span>
            </div>

            <div className="rounded-lg border bg-background/45 p-4 font-mono text-[11px] leading-relaxed overflow-x-auto">
              <pre className="text-muted-foreground">
{`import `}<span className="text-blue-400">{`{ SimplistClient }`}</span>{` from `}
<span className="text-green-400">"@simplist.blog/sdk"</span>
{`

`}<span className="text-blue-400">const</span>{` client = `}
<span className="text-blue-400">new</span>{` `}
<span className="text-yellow-400">SimplistClient</span>{`({
  apiKey: process.env.SIMPLIST_API_KEY,
})

`}<span className="text-blue-400">const</span>{` articles = `}
<span className="text-blue-400">await</span>{` client.`}
<span className="text-yellow-400">articles</span>{`.list({
  limit: 10,
  tag: `}<span className="text-green-400">"changelog"</span>{`,
})`}
              </pre>
            </div>

            <div className="mt-3 grid text-xs">
              <div className="flex items-center justify-between rounded-t-lg border-x border-t border-b bg-secondary/40 px-3 py-2">
                <span className="text-muted-foreground">Multi-tenant projects</span>
                <span className="text-emerald-300 font-medium">Built-in</span>
              </div>
              <div className="flex items-center justify-between rounded-b-lg border-x border-b bg-secondary/40 px-3 py-2">
                <span className="text-muted-foreground">Analytics & SEO API</span>
                <span className="text-emerald-300 font-medium">Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};