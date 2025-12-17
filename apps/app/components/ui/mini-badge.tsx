import { cn } from "@/lib/utils"
import Image from "next/image"

interface MiniBadgeProps {
  tier: "STARTER" | "PRO" | "LSTARTER" | "LPRO"
  size?: "sm" | "md" | "lg"
  className?: string
}

const BADGE_URLS = {
  STARTER: "https://cdn.simplist.blog/assets/billing/mini-starter-badge.png",
  PRO: "https://cdn.simplist.blog/assets/billing/mini-pro-badge.png",
  LSTARTER: "https://cdn.simplist.blog/assets/billing/badge-starter.png",
  LPRO: "https://cdn.simplist.blog/assets/billing/badge-pro.png",
}

const BADGE_SIZES = {
  sm: "h-4 w-auto",
  md: "h-5 w-auto",
  lg: "h-6 w-auto",
}

// For long badges, use h-3.5 as seen in switcher.tsx
const LONG_BADGE_SIZES = {
  sm: "h-3 w-auto",
  md: "h-3.5 w-auto",
  lg: "h-4 w-auto",
}

export const MiniBadge = ({ tier, size = "md", className }: MiniBadgeProps) => {
  const isLongBadge = tier.startsWith("L")
  const sizeClass = isLongBadge ? LONG_BADGE_SIZES[size] : BADGE_SIZES[size]

  return (
    <Image
      src={BADGE_URLS[tier]}
      alt={tier.replace("L", "")}
      width={100}
      height={100}
      className={cn("inline-block align-middle leading-none", sizeClass, className)}
    />
  )
}
