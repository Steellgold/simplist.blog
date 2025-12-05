"use client"

import { useState } from "react"
import { Check, Cog, Settings, X } from "lucide-react"
import { Button } from "@simplist/ui/components/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@simplist/ui/components/dialog"
import { InputGroupPasswordInput } from "@simplist/ui/components/password-input"
import { useApiKeyStore } from "@/lib/api-key-store"
import { useTestableApi } from "./testable-api-provider"
import { Field, FieldLabel, FieldDescription } from "@simplist/ui/components/field"
import { InputGroup, InputGroupAddon } from "@simplist/ui/components/input-group"
import { cn } from "@/lib/utils"

export const ApiConfigButton = () => {
  const { apiKey, setApiKey, clearApiKey } = useApiKeyStore()
  const { hasTestableApi } = useTestableApi()
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(apiKey)

  const handleSave = () => { setApiKey(inputValue); setOpen(false); };
  const handleClear = () => { clearApiKey(); setInputValue(""); };

  if (!hasTestableApi) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings />
          Configure
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configuration</DialogTitle>
          <DialogDescription>
            Set your API key to test endpoints directly from the documentation.
            The key is stored in your browser session only.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Field>
            <FieldLabel htmlFor="api-key">API Key</FieldLabel>
            <InputGroup>
              <InputGroupAddon className={cn(apiKey ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
                {apiKey ? <Check /> : <X />}
              </InputGroupAddon>

              <InputGroupPasswordInput
                placeholder="proj_***************eAg4"
                value={inputValue || ""}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </InputGroup>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleSave} disabled={!inputValue}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
