import { AbbrApi, ArrowRight, Play } from "@gravity-ui/icons";
import {
  AstroDark,
  AstroLight,
  Nextjs,
  RemixDark,
  RemixLight,
} from "@ridemountainpig/svgl-react";
import { Avatar, AvatarFallback } from "@simplist/ui/components/avatar";
import { buttonVariants } from "@simplist/ui/components/button";
import { IconThemed } from "@simplist/ui/components/icon-themed";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@simplist/ui/components/tooltip";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 py-12 md:py-32 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-8 text-center lg:text-left">
          <div className="h-0 lg:h-13" />

          <div className="space-y-4">
            <h1
              className="text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-syne)" }}
            >
              Ship content
              <span className="text-primary"> like you ship code</span>.
            </h1>

            <p className="text-muted-foreground mx-auto max-w-xl text-lg md:text-xl lg:mx-0">
              The developer-first headless CMS. Create articles, fetch them via API, done.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-row items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="https://app.simplist.blog/auth/register"
                className={buttonVariants({ variant: "default" })}
              >
                Start for free
                <ArrowRight />
              </Link>

              <Link
                href="#demo"
                className={buttonVariants({ variant: "outline" })}
              >
                <AbbrApi />
                Example
              </Link>
            </div>

            <p className="text-muted-foreground mt-4 text-center text-xs lg:mt-2 lg:text-left">
              No credit card required.
            </p>
          </div>

          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-xs lg:justify-start">
            <div className="flex items-center gap-2 rounded-full bg-black/5 py-1.5 pr-2 pl-2.5 dark:bg-white/5">
              Built for
              <TooltipProvider>
                <div className="*:data-[slot=avatar]:ring-background flex -space-x-2">
                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback>
                          <Nextjs className="size-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>Next.js</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback>
                          <IconThemed
                            light={<RemixLight className="size-3.5" />}
                            dark={<RemixDark className="size-3.5" />}
                          />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>Remix</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback>
                          <IconThemed
                            light={<AstroLight className="size-3.5" />}
                            dark={<AstroDark className="size-3.5" />}
                          />
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>Astro</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-1.5 rounded-full bg-black/5 py-1.5 pr-2 pl-1.5 dark:bg-white/5">
              <span className="inline-flex h-5 items-center rounded-full bg-emerald-900/10 px-2 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                50ms
              </span>
              global p95 latency
            </div>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="from-primary/15 via-primary/0 pointer-events-none absolute -inset-8 rounded-3xl bg-linear-to-tr to-emerald-400/20 blur-3xl" />

          <div className="bg-card/80 shadow-primary/10 relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur-sm">
            <div className="text-muted-foreground mb-4 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-2 w-2 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-emerald-700/80 dark:bg-emerald-400/80" />
                </span>
                TypeScript SDK
              </span>
              <span className="bg-secondary/60 rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase">
                Client example
              </span>
            </div>

            <div className="bg-background/45 rounded-lg border p-4 font-mono text-[11px] leading-relaxed">
              <pre className="text-muted-foreground overflow-x-auto">
                {`import `}
                <span className="text-blue-400">{`{ SimplistClient }`}</span>
                {` from `}
                <span className="text-green-400">"@simplist.blog/sdk"</span>
                {`

`}
                <span className="text-blue-400">const</span>
                {` client = `}
                <span className="text-blue-400">new</span>
                {` `}
                <span className="text-yellow-400">SimplistClient</span>
                {`({
  apiKey: process.env.SIMPLIST_API_KEY,
})

`}
                <span className="text-blue-400">const</span>
                {` articles = `}
                <span className="text-blue-400">await</span>
                {` client.`}
                <span className="text-yellow-400">articles</span>
                {`.list({
  limit: 10,
  tags: [`}
                <span className="text-green-400">"changelog"</span>
                {`]`}
                {`,
})`}
              </pre>
            </div>

            <div className="mt-3 grid text-xs">
              <div className="bg-secondary/40 flex items-center justify-between rounded-t-lg border-x border-t border-b px-3 py-2">
                <span className="text-muted-foreground">
                  Multi-tenant projects
                </span>
                <span className="font-medium text-emerald-300">Built-in</span>
              </div>
              <div className="bg-secondary/40 flex items-center justify-between rounded-b-lg border-x border-b px-3 py-2">
                <span className="text-muted-foreground">
                  Analytics & SEO API
                </span>
                <span className="font-medium text-emerald-300">Included</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
