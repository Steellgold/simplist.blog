"use client"

import { type ArticleVariant } from "@/hooks/use-variant-operations"
import { type LanguageCode } from "@/lib/types/languages"

interface VariantCardBaseProps {
  defaultLanguage: LanguageCode
  variants: ArticleVariant[]
  onVariantsUpdate: (variants: ArticleVariant[]) => void
  disabled?: boolean
  children: React.ReactNode
}

/**
 * Base component for variant management - provides all the logic
 * You can wrap this with your own UI implementation
 */
export function VariantCardBase({
  defaultLanguage,
  variants,
  onVariantsUpdate,
  disabled = false,
  children,
}: VariantCardBaseProps) {
  return (
    <div className="space-y-4">
      {children}
    </div>
  )
}