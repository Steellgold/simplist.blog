"use client"

import { LANGUAGES, type LanguageCode, getAllLanguages, getFlagUrl, getPopularLanguages } from "@/lib/types/languages"
import { Button } from "@simplist/ui/components/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@simplist/ui/components/command"
import { Popover, PopoverContent, PopoverTrigger } from "@simplist/ui/components/popover"
import { cn } from "@simplist/ui/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

interface LanguageSelectorProps {
  value?: LanguageCode
  onValueChange?: (value: LanguageCode) => void
  defaultValue?: LanguageCode
  placeholder?: string
  showPopular?: boolean
  disabled?: boolean
}

export function LanguageSelector({
  value: controlledValue,
  onValueChange,
  defaultValue = "en",
  placeholder = "Select a language...",
  showPopular = true,
  disabled = false,
}: LanguageSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<LanguageCode>(defaultValue)

  // Use controlled value if provided, otherwise use internal value
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue as LanguageCode

    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }

    onValueChange?.(newValue)
    setOpen(false)
  }

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === value)
  const popularLanguages = getPopularLanguages()
  const allLanguages = getAllLanguages()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-transparent",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {selectedLanguage ? (
            <div className="flex items-center gap-2">
              <img
                src={getFlagUrl(selectedLanguage.code)}
                alt={`${selectedLanguage.name} flag`}
                className="w-4 h-3 object-cover rounded-xs"
                onError={(e) => {
                  // Fallback to a generic icon if flag image fails to load
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span>{selectedLanguage.name}</span>
              <span className="text-muted-foreground text-sm">({selectedLanguage.nativeName})</span>
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
                        value === language.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <img
                      src={getFlagUrl(language.code)}
                      alt={`${language.name} flag`}
                      className="w-4 h-3 object-cover rounded-xs mr-2"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none'
                      }}
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
            )}

            <CommandGroup heading={showPopular ? "All Languages" : "Languages"}>
              {allLanguages
                .filter(lang => showPopular ? !popularLanguages.some(p => p.code === lang.code) : true)
                .map((language) => (
                  <CommandItem
                    key={language.code}
                    value={language.code}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === language.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <img
                      src={getFlagUrl(language.code)}
                      alt={`${language.name} flag`}
                      className="w-4 h-3 object-cover rounded-xs mr-2"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none'
                      }}
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
      </PopoverContent>
    </Popover>
  )
}

/**
 * Compact language selector that shows only the flag and language code
 */
export function CompactLanguageSelector({
  value: controlledValue,
  onValueChange,
  defaultValue = "en",
  disabled = false,
}: Omit<LanguageSelectorProps, 'placeholder' | 'showPopular'>) {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<LanguageCode>(defaultValue)

  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue as LanguageCode

    if (controlledValue === undefined) {
      setInternalValue(newValue)
    }

    onValueChange?.(newValue)
    setOpen(false)
  }

  const selectedLanguage = LANGUAGES.find((lang) => lang.code === value)
  const allLanguages = getAllLanguages()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-auto justify-between bg-transparent",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={disabled}
        >
          {selectedLanguage ? (
            <div className="flex items-center gap-1.5">
              <img
                src={getFlagUrl(selectedLanguage.code)}
                alt={`${selectedLanguage.name} flag`}
                className="w-4 h-3 object-cover rounded-xs"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <span className="text-sm">
                {selectedLanguage.name} ({selectedLanguage.nativeName})
              </span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select language</span>
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
                      value === language.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <img
                    src={getFlagUrl(language.code)}
                    alt={`${language.name} flag`}
                    className="w-4 h-3 object-cover rounded-xs mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
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
      </PopoverContent>
    </Popover>
  )
}
