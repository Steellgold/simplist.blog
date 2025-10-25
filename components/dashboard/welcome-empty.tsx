"use client"

import { buttonVariants } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { MiniBadge } from "@/components/ui/mini-badge"
import { SubscriptionTier } from "@prisma/client"
import { ArrowUpRightIcon, FileText, Key, LineChart } from "lucide-react"
import Link from "next/link"

interface WelcomeEmptyProps {
  projectSlug: string
  subscriptionTier: SubscriptionTier
}

export const WelcomeEmpty = ({ projectSlug, subscriptionTier }: WelcomeEmptyProps) => {
  const isStarter = subscriptionTier === "STARTER"

  return (
    <div className="max-w-2xl mx-auto flex flex-col min-h-[calc(90vh-4rem)] items-center justify-center">
      <div className="w-full">
        <Empty className="border from-muted/20 to-background h-full bg-gradient-to-b from-30%">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Create Your First Article</EmptyTitle>
            <EmptyDescription>
              Share your thoughts, stories, or tutorials with the world. It only takes a few minutes.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex gap-2">
              <Link
                href="https://docs.simplist.blog"
                target="_blank"
                className={buttonVariants({ size: "sm", variant: "link" })}
              >
                See documentation
                <ArrowUpRightIcon />
              </Link>

              <Link
                href={`/${projectSlug}/articles/new`}
                className={buttonVariants({ size: "sm", variant: "default" })}
              >
                <FileText />
                Create Article
              </Link>
            </div>
          </EmptyContent>
        </Empty>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Empty className="border from-muted/20 to-background h-full bg-gradient-to-l from-30%">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Key />
              </EmptyMedia>

              <EmptyTitle>Generate API Keys</EmptyTitle>
              <EmptyDescription>And manage your API keys</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href={`/${projectSlug}/api-keys`}
                className={buttonVariants({ size: "sm", variant: "outline" })}
              >
                <Key />
                Manage API Keys
              </Link>
            </EmptyContent>
          </Empty>

          <div className="relative group">
            <Empty className="border from-muted/20 to-background h-full bg-gradient-to-r from-30%">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LineChart />
                </EmptyMedia>
                <EmptyTitle>Track Analytics</EmptyTitle>
                <EmptyDescription>Monitor your audience engagement</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link
                  href={`/${projectSlug}/analytics`}
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                >
                  <LineChart />
                  View Analytics
                </Link>
              </EmptyContent>
            </Empty>

            {isStarter && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg overflow-hidden">
                <div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-t from-yellow-500/20 via-background/80 to-background/60" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <div className="flex flex-col items-center text-center gap-4 max-w-xs">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-base font-semibold text-foreground">
                        Unlock this feature
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        With a Pro subscription, you can unlock this feature and continue using the app.
                      </p>
                    </div>

                    <Link
                      href="/pricing"
                      className={buttonVariants({ size: "sm", variant: "default" })}
                    >
                      Unlock with
                      <MiniBadge tier="LPRO" size="md" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}