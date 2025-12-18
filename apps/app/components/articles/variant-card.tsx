"use client"

import { UpgradeOverlay } from "@/components/ui/upgrade-overlay"
import { useProject } from "@/hooks/use-project-context"
import { useVariantLimits } from "@/hooks/use-subscription-limits"
import { useVariantOperations, type ArticleVariant } from "@/hooks/use-variant-operations"
import { getAllLanguages, getFlagUrl, getLanguageName, getPopularLanguages, type LanguageCode } from "@/lib/types/languages"
import { cn } from "@/lib/utils"
import { Button } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@simplist/ui/components/command"
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@simplist/ui/components/dialog"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@simplist/ui/components/item"
import { toast } from "@simplist/ui/components/sonner"
import { Toggle } from "@simplist/ui/components/toggle"
import { Check, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { UpgradeProject } from "../projects/upgrade-project"

interface VariantCardProps {
  defaultLanguage: LanguageCode
  variants: ArticleVariant[]
  onVariantsUpdate: (variants: ArticleVariant[]) => void
  disabled?: boolean
  onVariantSelect?: (lang: LanguageCode) => void
  activeVariant?: LanguageCode
}

export const VariantCard = ({
  defaultLanguage,
  variants,
  onVariantsUpdate,
  disabled = false,
  onVariantSelect,
  activeVariant,
}: VariantCardProps) => {
  const { currentProject } = useProject()
  const [addVariantOpen, setAddVariantOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | undefined>(undefined)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [variantToDelete, setVariantToDelete] = useState<LanguageCode | null>(null)

  const {
    addVariant,
    removeVariant,
    variantCount
  } = useVariantOperations(variants, onVariantsUpdate, defaultLanguage)

  const { canAdd, isFreeTier, quotaError, isLoading: isLoadingLimits } = useVariantLimits(currentProject?.id, variantCount)

  const handleAddVariant = () => {
    if (!selectedLanguage) {
      toast.error("Please select a language")
      return
    }

    if (addVariant(selectedLanguage)) {
      toast.success(`Added ${getLanguageName(selectedLanguage)} variant`)
      setAddVariantOpen(false)
      setSelectedLanguage(undefined)
    } else {
      toast.error("A variant for this language already exists")
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setAddVariantOpen(open)
    if (!open) {
      setSelectedLanguage(undefined)
    }
  }

  const handleDeleteClick = (lang: LanguageCode) => {
    const variant = variants.find(v => v.lang === lang)
    const hasContent = variant && (variant.title || variant.content || variant.excerpt)

    if (hasContent) {
      setVariantToDelete(lang)
      setDeleteAlertOpen(true)
    } else {
      confirmDeleteVariant(lang)
    }
  }

  const confirmDeleteVariant = (lang: LanguageCode) => {
    if (removeVariant(lang)) {
      toast.success(`Removed ${getLanguageName(lang)} variant`)

      // Auto-select default variant after deletion
      if (onVariantSelect && activeVariant === lang) {
        onVariantSelect(defaultLanguage)
      }
    } else {
      toast.error("Cannot remove the default language variant")
    }

    setDeleteAlertOpen(false)
    setVariantToDelete(null)
  }

  const handleSelectVariant = (lang: LanguageCode) => {
    if (onVariantSelect) {
      onVariantSelect(lang)
      toast.success(`Switched to ${getLanguageName(lang)} variant`)
    }
  }

  return (
    <div className="relative group">
      <Card>
        <CardHeader>
          <CardTitle>Language Variants</CardTitle>
          <CardDescription>
            Manage different language versions of your article
          </CardDescription>

          <CardAction>
            <Dialog open={addVariantOpen} onOpenChange={handleDialogOpenChange}>
              {canAdd && (
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || !canAdd}
                  >
                    <Plus />
                    New Variant
                  </Button>
                </DialogTrigger>
              )}

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Variant</DialogTitle>
                  <DialogDescription>
                    Select a language to create a new variant of this article.
                  </DialogDescription>
                </DialogHeader>

                {!canAdd && quotaError ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {quotaError}
                    </div>

                    {currentProject && (
                      <UpgradeProject />
                    )}
                  </div>
                ) : (
                  <>
                    <Command className="border rounded-lg">
                      <CommandInput placeholder="Search languages..." />
                      <CommandList className="h-[300px] max-h-[300px]">
                        <CommandEmpty>No language found.</CommandEmpty>

                        <CommandGroup heading="Popular Languages">
                          {getPopularLanguages().map((language) => (
                            <CommandItem
                              key={`popular-${language.code}`}
                              value={`${language.name} ${language.nativeName} ${language.code}`}
                              onSelect={() => setSelectedLanguage(language.code)}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4",
                                  selectedLanguage === language.code ? "opacity-100" : "opacity-0"
                                )}
                              />

                              <Image
                                src={getFlagUrl(language.code)}
                                alt={`${language.name} flag`}
                                height={500}
                                width={500}
                                className="w-5 h-4 object-cover rounded-xs mr-2"
                              />

                              <div className="flex items-center gap-2 flex-1">
                                <span>{language.name}</span>
                                <span className="text-muted-foreground text-sm">
                                  {language.nativeName}
                                </span>
                              </div>

                              <span className="text-muted-foreground text-xs font-mono">
                                {language.code}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandGroup heading="All Languages">
                          {getAllLanguages()
                            .filter(lang => !getPopularLanguages().some(p => p.code === lang.code))
                            .map((language) => (
                              <CommandItem
                                key={language.code}
                                value={`${language.name} ${language.nativeName} ${language.code}`}
                                onSelect={() => setSelectedLanguage(language.code)}
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    selectedLanguage === language.code ? "opacity-100" : "opacity-0"
                                  )}
                                />

                                <img
                                  src={getFlagUrl(language.code)}
                                  alt={`${language.name} flag`}
                                  className="w-5 h-4 object-cover rounded-xs mr-2"
                                />

                                <div className="flex items-center gap-2 flex-1">
                                  <span>{language.name}</span>
                                  <span className="text-muted-foreground text-sm">
                                    {language.nativeName}
                                  </span>
                                </div>

                                <span className="text-muted-foreground text-xs font-mono">
                                  {language.code}
                                </span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        variant="default"
                        onClick={handleAddVariant}
                        disabled={!selectedLanguage}
                      >
                        <Plus />
                        Add Variant
                      </Button>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardAction>
        </CardHeader>

        <CardContent>
          <ItemGroup>
            {variants.map((variant) => {
              const isDefault = variant.lang === defaultLanguage
              const isActive = activeVariant === variant.lang

              return (
                <Item key={variant.lang} variant="outline" >
                  <ItemMedia variant="icon">
                    <Image
                      src={getFlagUrl(variant.lang)}
                      alt={`${getLanguageName(variant.lang)} flag`}
                      width={30}
                      height={30}
                      className="object-cover rounded-sm w-5 h-5"
                    />
                  </ItemMedia>

                  <ItemContent>
                    <ItemTitle>{getLanguageName(variant.lang)}</ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {isDefault ? "Default language" : (variant.title || "Untitled variant")}
                    </ItemDescription>
                  </ItemContent>

                  <ItemActions>
                    <ButtonGroup>
                      <Toggle
                        pressed={isActive}
                        onPressedChange={() => handleSelectVariant(variant.lang)}
                        disabled={disabled || isFreeTier}
                        variant="outline"
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        <Check />
                      </Toggle>

                      {!isDefault && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteClick(variant.lang)
                          }}
                          disabled={disabled || isFreeTier}
                          className="hover:text-destructive hover:bg-destructive/10"
                          title={`Delete ${getLanguageName(variant.lang)} variant`}
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </ButtonGroup>
                  </ItemActions>
                </Item>
              )
            })}
          </ItemGroup>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={() => variantToDelete && confirmDeleteVariant(variantToDelete)}
        title="Delete variant?"
        description={
          variantToDelete
            ? `This variant contains content. Are you sure you want to delete the ${getLanguageName(variantToDelete)} variant? This action will be applied when you update the article.`
            : "This action will be applied when you update the article."
        }
        confirmText="Delete"
        variant="destructive"
      />

      {/* Pro Backdrop */}
      {!isLoadingLimits && isFreeTier && (
        <UpgradeOverlay
          title="Unlock this feature"
          description="Create article variants in different languages to reach a global audience."
        />
      )}
    </div>
  )
}