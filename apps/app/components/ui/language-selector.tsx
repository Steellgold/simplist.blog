"use client";

import {
  LANGUAGES,
  type LanguageCode,
  getAllLanguages,
  getFlagUrl,
  getPopularLanguages,
} from "@/lib/types/languages";
import { Button } from "@simplist/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@simplist/ui/components/command";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@simplist/ui/components/popover";
import { cn } from "@simplist/ui/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

interface LanguageSelectorProps {
  value?: LanguageCode;
  onValueChange?: (value: LanguageCode) => void;
  defaultValue?: LanguageCode;
  placeholder?: string;
  showPopular?: boolean;
  disabled?: boolean;
  dialog?: boolean;
}

export function LanguageSelector({
  value: controlledValue,
  onValueChange,
  defaultValue = "en",
  placeholder = "Select a language...",
  showPopular = true,
  disabled = false,
  dialog = false,
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] =
    useState<LanguageCode>(defaultValue);
  const [selectedLang, setSelectedLang] = useState<LanguageCode | undefined>(
    controlledValue || defaultValue,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize selectedLang with value prop when it changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedLang(controlledValue);
    }
  }, [controlledValue]);

  // Use controlled value if provided, otherwise use internal value
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue as LanguageCode;

    if (dialog) {
      setSelectedLang(newValue);
    } else {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      onValueChange?.(newValue);
      setOpen(false);
    }
  };

  const handleDialogConfirm = () => {
    if (selectedLang) {
      if (controlledValue === undefined) {
        setInternalValue(selectedLang);
      }
      onValueChange?.(selectedLang);
    }
    setOpen(false);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedLang(value);
    }
  };

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === value);
  const popularLanguages = getPopularLanguages();
  const allLanguages = getAllLanguages();

  if (!mounted) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          "w-full justify-between bg-transparent",
          disabled && "cursor-not-allowed opacity-50",
        )}
        disabled
      >
        {selectedLanguage ? (
          <div className="flex items-center gap-2">
            <img
              src={getFlagUrl(selectedLanguage.code)}
              alt={`${selectedLanguage.name} flag`}
              className="h-3 w-4 rounded-xs object-cover"
              onError={(e) => {
                // Fallback to a generic icon if flag image fails to load
                e.currentTarget.style.display = "none";
              }}
            />
            <span>{selectedLanguage.name}</span>
            <span className="text-muted-foreground text-sm">
              ({selectedLanguage.nativeName})
            </span>
          </div>
        ) : (
          placeholder
        )}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (dialog) {
    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between bg-transparent",
              disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={disabled}
          >
            {selectedLanguage ? (
              <div className="flex items-center gap-2">
                <img
                  src={getFlagUrl(selectedLanguage.code)}
                  alt={`${selectedLanguage.name} flag`}
                  className="h-3 w-4 rounded-xs object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span>{selectedLanguage.name}</span>
                <span className="text-muted-foreground text-sm">
                  ({selectedLanguage.nativeName})
                </span>
              </div>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
            <DialogDescription>
              Choose the language for your content.
            </DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>

              {showPopular && (
                <CommandGroup heading="Popular Languages">
                  {popularLanguages.map((language) => (
                    <CommandItem
                      key={`popular-${language.code}`}
                      value={language.code}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedLang === language.code
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <img
                        src={getFlagUrl(language.code)}
                        alt={`${language.name} flag`}
                        className="mr-2 h-3 w-4 rounded-xs object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
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
              )}

              <CommandGroup
                heading={showPopular ? "All Languages" : "Languages"}
              >
                {allLanguages
                  .filter((lang) =>
                    showPopular
                      ? !popularLanguages.some((p) => p.code === lang.code)
                      : true,
                  )
                  .map((language) => (
                    <CommandItem
                      key={language.code}
                      value={language.code}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selectedLang === language.code
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <img
                        src={getFlagUrl(language.code)}
                        alt={`${language.name} flag`}
                        className="mr-2 h-3 w-4 rounded-xs object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDialogConfirm}
              disabled={!selectedLang}
            >
              Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-transparent",
            disabled && "cursor-not-allowed opacity-50",
          )}
          disabled={disabled}
        >
          {selectedLanguage ? (
            <div className="flex items-center gap-2">
              <img
                src={getFlagUrl(selectedLanguage.code)}
                alt={`${selectedLanguage.name} flag`}
                className="h-3 w-4 rounded-xs object-cover"
                onError={(e) => {
                  // Fallback to a generic icon if flag image fails to load
                  e.currentTarget.style.display = "none";
                }}
              />
              <span>{selectedLanguage.name}</span>
              <span className="text-muted-foreground text-sm">
                ({selectedLanguage.nativeName})
              </span>
            </div>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>

            {showPopular && (
              <CommandGroup heading="Popular Languages">
                {popularLanguages.map((language) => (
                  <CommandItem
                    key={`popular-${language.code}`}
                    value={language.code}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === language.code ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <img
                      src={getFlagUrl(language.code)}
                      alt={`${language.name} flag`}
                      className="mr-2 h-3 w-4 rounded-xs object-cover"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = "none";
                      }}
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
            )}

            <CommandGroup heading={showPopular ? "All Languages" : "Languages"}>
              {allLanguages
                .filter((lang) =>
                  showPopular
                    ? !popularLanguages.some((p) => p.code === lang.code)
                    : true,
                )
                .map((language) => (
                  <CommandItem
                    key={language.code}
                    value={language.code}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === language.code ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <img
                      src={getFlagUrl(language.code)}
                      alt={`${language.name} flag`}
                      className="mr-2 h-3 w-4 rounded-xs object-cover"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = "none";
                      }}
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
      </PopoverContent>
    </Popover>
  );
}

/**
 * Compact language selector that shows only the flag and language code
 */
export function CompactLanguageSelector({
  value: controlledValue,
  onValueChange,
  defaultValue = "en",
  disabled = false,
  dialog = false,
}: Omit<LanguageSelectorProps, "placeholder" | "showPopular">) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] =
    useState<LanguageCode>(defaultValue);
  const [selectedLang, setSelectedLang] = useState<LanguageCode | undefined>(
    controlledValue || defaultValue,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Synchronize selectedLang with value prop when it changes
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSelectedLang(controlledValue);
    }
  }, [controlledValue]);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue as LanguageCode;

    if (dialog) {
      setSelectedLang(newValue);
    } else {
      if (controlledValue === undefined) {
        setInternalValue(newValue);
      }

      onValueChange?.(newValue);
      setOpen(false);
    }
  };

  const handleDialogConfirm = () => {
    if (selectedLang) {
      if (controlledValue === undefined) {
        setInternalValue(selectedLang);
      }
      onValueChange?.(selectedLang);
    }
    setOpen(false);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSelectedLang(value);
    }
  };

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === value);
  const allLanguages = getAllLanguages();

  if (!mounted) {
    return (
      <Button
        variant="outline"
        role="combobox"
        className={cn(
          "w-auto justify-between bg-transparent",
          disabled && "cursor-not-allowed opacity-50",
        )}
        disabled
      >
        {selectedLanguage ? (
          <div className="flex items-center gap-1.5">
            <img
              src={getFlagUrl(selectedLanguage.code)}
              alt={`${selectedLanguage.name} flag`}
              className="h-3 w-4 rounded-xs object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-sm">
              {selectedLanguage.name} ({selectedLanguage.nativeName})
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Select language</span>
        )}
        <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
      </Button>
    );
  }

  if (dialog) {
    return (
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-auto justify-between bg-transparent",
              disabled && "cursor-not-allowed opacity-50",
            )}
            disabled={disabled}
          >
            {selectedLanguage ? (
              <div className="flex items-center gap-1.5">
                <img
                  src={getFlagUrl(selectedLanguage.code)}
                  alt={`${selectedLanguage.name} flag`}
                  className="h-3 w-4 rounded-xs object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-sm">
                  {selectedLanguage.name} ({selectedLanguage.nativeName})
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">
                Select language
              </span>
            )}
            <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
            <DialogDescription>
              Choose the default language for your content.
            </DialogDescription>
          </DialogHeader>
          <Command>
            <CommandInput placeholder="Search languages..." />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {allLanguages.map((language) => (
                  <CommandItem
                    key={language.code}
                    value={`${language.name} ${language.nativeName} ${language.code}`}
                    onSelect={() => handleSelect(language.code)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedLang === language.code
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    <img
                      src={getFlagUrl(language.code)}
                      alt={`${language.name} flag`}
                      className="mr-2 h-3 w-4 rounded-xs object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDialogConfirm}
              disabled={!selectedLang}
            >
              Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-auto justify-between bg-transparent",
            disabled && "cursor-not-allowed opacity-50",
          )}
          disabled={disabled}
        >
          {selectedLanguage ? (
            <div className="flex items-center gap-1.5">
              <img
                src={getFlagUrl(selectedLanguage.code)}
                alt={`${selectedLanguage.name} flag`}
                className="h-3 w-4 rounded-xs object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <span className="text-sm">
                {selectedLanguage.name} ({selectedLanguage.nativeName})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">
              Select language
            </span>
          )}
          <ChevronsUpDown className="ml-1 size-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search languages..." />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {allLanguages.map((language) => (
                <CommandItem
                  key={language.code}
                  value={`${language.name} ${language.nativeName} ${language.code}`}
                  onSelect={() => handleSelect(language.code)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === language.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <img
                    src={getFlagUrl(language.code)}
                    alt={`${language.name} flag`}
                    className="mr-2 h-3 w-4 rounded-xs object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
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
      </PopoverContent>
    </Popover>
  );
}
