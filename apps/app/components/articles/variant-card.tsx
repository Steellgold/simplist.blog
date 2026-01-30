"use client";

import { UpgradeOverlay } from "@/components/ui/upgrade-overlay";
import { useProject } from "@/hooks/use-project-context";
import { useVariantLimits } from "@/hooks/use-subscription-limits";
import {
  useVariantOperations,
  type ArticleVariant,
} from "@/hooks/use-variant-operations";
import { type ProjectSubscription } from "@/lib/subscription/quota-check";
import {
  getAllLanguages,
  getFlagUrl,
  getLanguageName,
  getPopularLanguages,
  type LanguageCode,
} from "@/lib/types/languages";
import { cn } from "@/lib/utils";
import { Check, Plus, TrashBin } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@simplist/ui/components/dialog";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@simplist/ui/components/item";
import { toast } from "@simplist/ui/components/sonner";
import { Toggle } from "@simplist/ui/components/toggle";
import Image from "next/image";
import { useState } from "react";
import { UpgradeProject } from "../projects/upgrade-project";

interface VariantCardProps {
  defaultLanguage: LanguageCode;
  variants: ArticleVariant[];
  onVariantsUpdate: (variants: ArticleVariant[]) => void;
  disabled?: boolean;
  onVariantSelect?: (lang: LanguageCode) => void;
  activeVariant?: LanguageCode;
  subscription?: ProjectSubscription;
}

export const VariantCard = ({
  defaultLanguage,
  variants,
  onVariantsUpdate,
  disabled = false,
  onVariantSelect,
  activeVariant,
  subscription: initialSubscription,
}: VariantCardProps) => {
  const { currentProject } = useProject();
  const [addVariantOpen, setAddVariantOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<
    LanguageCode | undefined
  >(undefined);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<LanguageCode | null>(
    null,
  );

  const { addVariant, removeVariant, nonDefaultCount } = useVariantOperations(
    variants,
    onVariantsUpdate,
    defaultLanguage,
  );

  // Use subscription from props if available, otherwise fetch it
  const {
    canAdd: fetchedCanAdd,
    isFreeTier: fetchedIsFreeTier,
    quotaError: fetchedQuotaError,
    isLoading: isLoadingLimits,
    tier: fetchedTier,
    max: fetchedMax,
  } = useVariantLimits(
    initialSubscription ? undefined : currentProject?.id,
    nonDefaultCount, // Use non-default count for quota check
  );

  // Use values from initialSubscription if provided, otherwise use fetched values
  const tier = initialSubscription?.tier ?? fetchedTier;
  const max = initialSubscription?.limits.maxVariantsPerArticle ?? fetchedMax;
  const isFree = tier === "STARTER";

  // STARTER can add 1 variant (max = 1), PRO has unlimited (max = -1)
  const canAdd = initialSubscription
    ? max === -1 || nonDefaultCount < max
    : fetchedCanAdd;
  const isFreeTier = initialSubscription ? isFree : fetchedIsFreeTier;
  const isAtLimit = max !== -1 && nonDefaultCount >= max;
  const shouldShowOverlay = max === 0; // Only show overlay if plan allows 0 variants
  const quotaError = initialSubscription
    ? isAtLimit
      ? `You have reached the limit. Your ${tier} plan allows ${max} variant${max === 1 ? "" : "s"} per article.`
      : isFreeTier && nonDefaultCount > 0
        ? "Upgrade to Pro to add more variants and reach a global audience."
        : undefined
    : fetchedQuotaError;

  const handleAddVariant = () => {
    if (!selectedLanguage) {
      toast.error("Please select a language");
      return;
    }

    if (addVariant(selectedLanguage)) {
      toast.success(`Added ${getLanguageName(selectedLanguage)} variant`);
      setAddVariantOpen(false);
      setSelectedLanguage(undefined);
    } else {
      toast.error("A variant for this language already exists");
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setAddVariantOpen(open);
    if (!open) {
      setSelectedLanguage(undefined);
    }
  };

  const handleDeleteClick = (lang: LanguageCode) => {
    const variant = variants.find((v) => v.lang === lang);
    const hasContent =
      variant && (variant.title || variant.content || variant.excerpt);

    if (hasContent) {
      setVariantToDelete(lang);
      setDeleteAlertOpen(true);
    } else {
      confirmDeleteVariant(lang);
    }
  };

  const confirmDeleteVariant = (lang: LanguageCode) => {
    if (removeVariant(lang)) {
      toast.success(`Removed ${getLanguageName(lang)} variant`);

      // Auto-select default variant after deletion
      if (onVariantSelect && activeVariant === lang) {
        onVariantSelect(defaultLanguage);
      }
    } else {
      toast.error("Cannot remove the default language variant");
    }

    setDeleteAlertOpen(false);
    setVariantToDelete(null);
  };

  const handleSelectVariant = (lang: LanguageCode) => {
    if (onVariantSelect) {
      onVariantSelect(lang);
      toast.success(`Switched to ${getLanguageName(lang)} variant`);
    }
  };

  return (
    <div className="group relative">
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
                  disabled={disabled || !canAdd}
                >
                  <Plus />
                  Variant
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Variant</DialogTitle>
                  <DialogDescription>
                    Select a language to create a new variant of this article.
                  </DialogDescription>
                </DialogHeader>

                {!canAdd && quotaError ? (
                  <div className="space-y-4">
                    <div className="text-muted-foreground text-sm">
                      {quotaError}
                    </div>

                    {currentProject && <UpgradeProject />}
                  </div>
                ) : (
                  <>
                    <Command className="rounded-lg border">
                      <CommandInput placeholder="Search languages..." />
                      <CommandList className="h-[300px] max-h-[300px]">
                        <CommandEmpty>No language found.</CommandEmpty>

                        <CommandGroup heading="Popular Languages">
                          {getPopularLanguages().map((language) => (
                            <CommandItem
                              key={`popular-${language.code}`}
                              value={`${language.name} ${language.nativeName} ${language.code}`}
                              onSelect={() =>
                                setSelectedLanguage(language.code)
                              }
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4",
                                  selectedLanguage === language.code
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />

                              <Image
                                src={getFlagUrl(language.code)}
                                alt={`${language.name} flag`}
                                height={500}
                                width={500}
                                className="mr-2 h-4 w-5 rounded-xs object-cover"
                              />

                              <div className="flex flex-1 items-center gap-2">
                                <span>{language.name}</span>
                                <span className="text-muted-foreground text-sm">
                                  {language.nativeName}
                                </span>
                              </div>

                              <span className="text-muted-foreground font-mono text-xs">
                                {language.code}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>

                        <CommandGroup heading="All Languages">
                          {getAllLanguages()
                            .filter(
                              (lang) =>
                                !getPopularLanguages().some(
                                  (p) => p.code === lang.code,
                                ),
                            )
                            .map((language) => (
                              <CommandItem
                                key={language.code}
                                value={`${language.name} ${language.nativeName} ${language.code}`}
                                onSelect={() =>
                                  setSelectedLanguage(language.code)
                                }
                                className="cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 size-4",
                                    selectedLanguage === language.code
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />

                                <img
                                  src={getFlagUrl(language.code)}
                                  alt={`${language.name} flag`}
                                  className="mr-2 h-4 w-5 rounded-xs object-cover"
                                />

                                <div className="flex flex-1 items-center gap-2">
                                  <span>{language.name}</span>
                                  <span className="text-muted-foreground text-sm">
                                    {language.nativeName}
                                  </span>
                                </div>

                                <span className="text-muted-foreground font-mono text-xs">
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
              const isDefault = variant.lang === defaultLanguage;
              const isActive = activeVariant === variant.lang;

              return (
                <Item key={variant.lang} variant="outline">
                  <ItemMedia variant="icon">
                    <Image
                      src={getFlagUrl(variant.lang)}
                      alt={`${getLanguageName(variant.lang)} flag`}
                      width={30}
                      height={30}
                      className="h-5 w-5 rounded-sm object-cover"
                    />
                  </ItemMedia>

                  <ItemContent>
                    <ItemTitle>{getLanguageName(variant.lang)}</ItemTitle>
                    <ItemDescription className="line-clamp-1">
                      {isDefault
                        ? "Default language"
                        : variant.title || "Untitled variant"}
                    </ItemDescription>
                  </ItemContent>

                  <ItemActions>
                    <ButtonGroup>
                      <Toggle
                        pressed={isActive}
                        onPressedChange={() =>
                          handleSelectVariant(variant.lang)
                        }
                        disabled={disabled}
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
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(variant.lang);
                          }}
                          disabled={disabled}
                          className="hover:text-destructive hover:bg-destructive/10"
                          title={`Delete ${getLanguageName(variant.lang)} variant`}
                        >
                          <TrashBin />
                        </Button>
                      )}
                    </ButtonGroup>
                  </ItemActions>
                </Item>
              );
            })}
          </ItemGroup>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      <ConfirmDialog
        open={deleteAlertOpen}
        onOpenChange={setDeleteAlertOpen}
        onConfirm={() =>
          variantToDelete && confirmDeleteVariant(variantToDelete)
        }
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
      {!isLoadingLimits && shouldShowOverlay && (
        <UpgradeOverlay
          title="Unlock this feature"
          description="Create article variants in different languages to reach a global audience."
        />
      )}
    </div>
  );
};
