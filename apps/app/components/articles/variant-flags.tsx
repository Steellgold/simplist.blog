"use client"

import { getFlagUrl, LanguageCode } from "@/lib/types/languages"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface VariantFlagsProps {
  variants: Array<{
    lang: LanguageCode
  }>
  maxVisible?: number
  size?: "sm" | "md"
}

export const VariantFlags = ({
  variants,
  maxVisible = 4,
  size = "md"
}: VariantFlagsProps) => {
  if (!variants || variants.length === 0) {
    return null
  }

  const visibleVariants = variants.slice(0, maxVisible)
  const remainingCount = Math.max(0, variants.length - maxVisible)
  const hasMore = remainingCount > 0

  const sizeClasses = {
    sm: { flag: "w-5 h-4", text: "text-[10px]" },
    md: { flag: "w-6 h-4", text: "text-xs" }
  }

  const classes = sizeClasses[size]

  return (
    <div className="gap-1 grid grid-cols-2">
      {visibleVariants.map((variant, index) => {
        const isLast = index === visibleVariants.length - 1
        const shouldBlur = hasMore && isLast

        return (
          <div
            key={variant.lang}
            className="relative rounded-xs overflow-hidden border border-border"
          >
            <Image
              src={getFlagUrl(variant.lang)}
              alt={`${variant.lang} flag`}
              width={size === "sm" ? 20 : 24}
              height={16}
              className={cn("object-cover", classes.flag, shouldBlur && "blur-[2px]")}
            />

            {shouldBlur && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                <span className={cn("text-white font-semibold", classes.text)}>
                  +{remainingCount}
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
