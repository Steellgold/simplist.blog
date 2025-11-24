"use client"

import { UpgradeOverlay } from "@/components/ui/upgrade-overlay"
import { useProject } from "@/hooks/use-project-context"
import { useVariantLimits } from "@/hooks/use-subscription-limits"
import { useVariantOperations, type ArticleVariant } from "@/hooks/use-variant-operations"
import { getAllLanguages, getFlagUrl, getLanguageName, getPopularLanguages, type LanguageCode } from "@/lib/types/languages"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@simplist/ui/components/alert-dialog"
import { Button } from "@simplist/ui/components/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@simplist/ui/components/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@simplist/ui/components/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@simplist/ui/components/field"
import { RadioGroup, RadioGroupItem } from "@simplist/ui/components/radio-group"
import { toast } from "@simplist/ui/components/sonner"
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

  const { canAddVariant, isFreeTier, quotaError, isLoading: isLoadingLimits } = useVariantLimits(currentProject?.id, variantCount)

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
                        size="sm"
                        onClick={() => handleDialogOpenChange(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
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

        <CardContent className="space-y-4">
          <FieldGroup>
            <FieldSet>
              <RadioGroup value={activeVariant} onValueChange={handleSelectVariant}>
                {variants.map((variant) => {
                  const isDefault = variant.lang === defaultLanguage

                  return (
                    <FieldLabel key={variant.lang} htmlFor={`variant-${variant.lang}`} className="cursor-pointer">
                      <Field orientation="horizontal" className="items-start py-1">
                        <div className="flex items-start gap-3 flex-1 pt-1">
                          <Image
                            src={getFlagUrl(variant.lang)}
                            alt={`${getLanguageName(variant.lang)} flag`}
                            width={24}
                            height={16}
                            className="object-cover rounded mt-0.5"
                          />

                          <FieldContent className="gap-0.5">
                            <FieldTitle className="font-medium">{getLanguageName(variant.lang)}</FieldTitle>
                            <FieldDescription className="text-sm">
                              {isDefault ? "Default language" : (variant.title || "Untitled variant")}
                            </FieldDescription>
                          </FieldContent>
                        </div>
                        <RadioGroupItem
                          value={variant.lang}
                          id={`variant-${variant.lang}`}
                          disabled={disabled || isFreeTier}
                          className="mt-1 shrink-0"
                        />
                      </Field>
                    </FieldLabel>
                  )
                })}
              </RadioGroup>
            </FieldSet>
          </FieldGroup>
        </CardContent>

        {activeVariant && activeVariant !== defaultLanguage && (
          <CardFooter className="border-t">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(activeVariant)}
              disabled={disabled || isFreeTier}
              className="w-full"
            >
              <Trash2 />
              Delete this variant
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This variant contains content. Are you sure you want to delete the{" "}
              <strong>{variantToDelete && getLanguageName(variantToDelete)}</strong> variant?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => variantToDelete && confirmDeleteVariant(variantToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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