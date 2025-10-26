"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LanguageSelector } from "@/components/ui/language-selector"
import { toast } from "@/components/ui/sonner"
import { UpgradeOverlay } from "@/components/ui/upgrade-overlay"
import { useProject } from "@/hooks/use-project-context"
import { useVariantLimits } from "@/hooks/use-subscription-limits"
import { useVariantOperations, type ArticleVariant } from "@/hooks/use-variant-operations"
import { getFlagUrl, getLanguageName, type LanguageCode } from "@/lib/types/languages"
import { Edit, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { UpgradeProject } from "../projects/upgrade-project"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "../ui/item"

interface VariantCardProps {
  defaultLanguage: LanguageCode
  variants: ArticleVariant[]
  onVariantsUpdate: (variants: ArticleVariant[]) => void
  disabled?: boolean
  onVariantSelect?: (lang: LanguageCode) => void
  activeVariant?: LanguageCode
}

export function VariantCard({
  defaultLanguage,
  variants,
  onVariantsUpdate,
  disabled = false,
  onVariantSelect,
  activeVariant,
}: VariantCardProps) {
  const { currentProject } = useProject()
  const [addVariantOpen, setAddVariantOpen] = useState(false)
  
  const {
    addVariant,
    removeVariant,
    getNonDefaultVariants,
    getDefaultVariant,
    variantCount,
    hasNonDefaultVariants
  } = useVariantOperations(variants, onVariantsUpdate, defaultLanguage)
  
  const { canAddVariant, isFreeTier, quotaError } = useVariantLimits(currentProject?.id, variantCount)

  const handleAddVariant = (lang: LanguageCode) => {
    if (addVariant(lang)) {
      toast.success(`Added ${getLanguageName(lang)} variant`)
      setAddVariantOpen(false)
    } else {
      toast.error("A variant for this language already exists")
    }
  }

  const handleRemoveVariant = (lang: LanguageCode) => {
    if (removeVariant(lang)) {
      toast.success(`Removed ${getLanguageName(lang)} variant`)
    } else {
      toast.error("Cannot remove the default language variant")
    }
  }

  const handleSelectVariant = (lang: LanguageCode) => {
    if (onVariantSelect) {
      onVariantSelect(lang)
      toast.success(`Switched to ${getLanguageName(lang)} variant`)
    }
  }

  const handleEditVariant = (lang: LanguageCode) => {
    if (onVariantSelect) {
      onVariantSelect(lang)
      toast.success(`Now editing ${getLanguageName(lang)} variant`)
    }
  }


  const defaultVariant = getDefaultVariant()
  const nonDefaultVariants = getNonDefaultVariants()

  return (
    <div className="relative group">
      <Card>
        <CardHeader>
          <CardTitle>Language Variants</CardTitle>
          <CardDescription>
            Manage different language versions of your article
          </CardDescription>

          <CardAction>
            <Dialog open={addVariantOpen} onOpenChange={setAddVariantOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || !canAddVariant}
                >
                  <Plus />
                  New Variant
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Variant</DialogTitle>
                  <DialogDescription>
                    Select a language to create a new variant of this article.
                  </DialogDescription>
                </DialogHeader>

                {!canAddVariant && quotaError ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {quotaError}
                    </div>
                    {currentProject && (
                      <UpgradeProject />
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Select a language that doesn't already have a variant.
                    </div>
                    <LanguageSelector
                      placeholder="Choose a language..."
                      onValueChange={handleAddVariant}
                      showPopular={true}
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Default Language */}
          {defaultVariant && (
            <Item variant="outline">
              <ItemMedia variant="icon">
                <img src={getFlagUrl(defaultVariant.lang)} alt={`${getLanguageName(defaultVariant.lang)} flag`} className="w-4 h-3 object-cover" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {getLanguageName(defaultVariant.lang)}
                  {activeVariant === defaultVariant.lang && (
                    <Badge variant="default">Active</Badge>
                  )}
                </ItemTitle>
                <ItemDescription>Default language</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="secondary">Default</Badge>
                {onVariantSelect && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditVariant(defaultVariant.lang)}
                    disabled={disabled || isFreeTier}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </ItemActions>
            </Item>
          )}

          {/* Additional Variants */}
          {hasNonDefaultVariants && (
            <>
              <CardDescription>Additional Variants</CardDescription>
              <ItemGroup>
                {nonDefaultVariants.map((variant) => (
                  <Item key={variant.lang} variant="outline">
                    <ItemMedia variant="icon">
                      <img src={getFlagUrl(variant.lang)} alt={`${getLanguageName(variant.lang)} flag`} className="w-4 h-3 object-cover" />
                    </ItemMedia>
                      <ItemContent>
                        <ItemTitle>
                          {getLanguageName(variant.lang)}
                          {activeVariant === variant.lang && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </ItemTitle>
                        <ItemDescription>
                          {variant.title || "Untitled variant"}
                          {!variant.coverImage && (
                            <span className="text-xs text-muted-foreground block mt-1">
                              Uses default article image
                            </span>
                          )}
                        </ItemDescription>
                      </ItemContent>
                    <ItemActions>
                      {onVariantSelect && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVariant(variant.lang)}
                          disabled={disabled || isFreeTier}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outlineDestructive"
                        size="sm"
                        onClick={() => handleRemoveVariant(variant.lang)}
                        disabled={disabled || isFreeTier}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            </>
          )}

          {/* Usage Info */}
          <div className="text-xs text-muted-foreground">
            {variantCount} variant{variantCount === 1 ? '' : 's'} total
          </div>
        </CardContent>
      </Card>

      {/* Pro Backdrop */}
      {isFreeTier && (
        <UpgradeOverlay
          title="Unlock this feature"
          description="Create article variants in different languages to reach a global audience."
        />
      )}

    </div>
  )
}