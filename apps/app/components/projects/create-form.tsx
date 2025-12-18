"use client"

import { generateSlug } from "@/lib/utils"
import { CreateProjectInput, createProjectSchema, DEFAULT_ARTICLE_URL_PATTERN, isReservedSlug, PROJECT_NAME_MAX_LENGTH, ProjectStep, STEP_ICON, STEP_NAME, STEP_PLAN, STEP_URLS, WILDCARD_PROTOCOLS } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlanIds, SUBSCRIPTION_PLANS, SubscriptionInterval } from "@simplist/limits"
import { BillingToggle } from "@simplist/ui/components/billing-toggle"
import { Button } from "@simplist/ui/components/button"
import { ColorSelector } from "@simplist/ui/components/color-selector"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@simplist/ui/components/field"
import { IconPicker } from "@simplist/ui/components/icon-picker"
import { Input } from "@simplist/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupSelect } from "@simplist/ui/components/input-group"
import { Label } from "@simplist/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@simplist/ui/components/radio-group"
import { Select, SelectContent, SelectItem, SelectValue } from "@simplist/ui/components/select"
import { c, getColorValue, getIconTextColorWithBackgroundColorOf } from "@simplist/ui/lib/color"
import { i } from "@simplist/ui/lib/icons.enum"
import { cn } from "@simplist/ui/lib/utils"
import { ChevronRight, Plus, X } from "lucide-react"
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { InfoTooltip } from "@simplist/ui/components/info-tooltip"
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@simplist/ui/components/item"
import { IconRender } from "@simplist/ui/components/icon-renderer"

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

interface CreateProjectFormProps {
  className?: string
  step: ProjectStep
  onNext: () => void
  onBack: () => void
  onStepChange: (step: ProjectStep) => void
  onSubmit: (data: CreateProjectInput & { selectedPlan: PlanIds, billingInterval: SubscriptionInterval }) => void
  onFormChange?: (hasData: boolean) => void
  isSubmitting: boolean
  error: string
}

export const CreateProjectForm = forwardRef<
  {
    validateStep: (step: number) => Promise<boolean>
    submitForm: () => void
    resetForm: () => void
    hasData: boolean
  },
  CreateProjectFormProps
>(({ className, step, onNext, onBack, onStepChange, onSubmit, onFormChange, isSubmitting, error, ...props }, ref) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanIds>("STARTER")
  const [billingInterval, setBillingInterval] = useState<SubscriptionInterval>("monthly")
  const [originPrefixes, setOriginPrefixes] = useState<Record<string, WILDCARD_PROTOCOLS>>({})

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: {
      name: "",
      allowedOrigins: [],
      color: "YELLOW",
      icon: "building-2",
      baseUrl: null,
      articleUrlPattern: "posts/{slug}",
    },
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    trigger,
    formState: {
      errors
    }
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowedOrigins"
  })

  const checkHasData = () => {
    const values = form.getValues()
    return (
      values.name !== "" ||
      values.icon !== "building-2" ||
      values.color !== "YELLOW" ||
      values.baseUrl !== null ||
      values.articleUrlPattern !== DEFAULT_ARTICLE_URL_PATTERN ||
      (values.allowedOrigins && values.allowedOrigins.length > 0) ||
      selectedPlan !== "STARTER" ||
      billingInterval !== "monthly"
    )
  }

  // Notify parent when form data changes
  useEffect(() => {
    if (onFormChange) {
      const subscription = watch(() => {
        onFormChange(checkHasData())
      })
      return () => subscription.unsubscribe()
    }
  }, [watch, onFormChange, selectedPlan, billingInterval])

  useImperativeHandle(ref, () => ({
    validateStep: async (stepToValidate: number) => {
      if (stepToValidate === STEP_NAME) {
        const nameIsValid = await trigger("name")
        if (!nameIsValid) return false

        const currentName = watch("name")
        if (currentName && isReservedSlug(generateSlug(currentName))) {
          return false
        }

        return true
      }
      return true
    },
    submitForm: handleCreateProject,
    resetForm: () => {
      form.reset()
      setSelectedPlan("STARTER")
      setBillingInterval("monthly")
      setOriginPrefixes({})
    },
    get hasData() {
      return checkHasData()
    }
  }))

  const handleFormSubmit = (e: React.FormEvent) => e.preventDefault()

  const handleCreateProject = () => {
    handleSubmit((data) => {
      // Combine prefix with origin values
      const processedOrigins = data.allowedOrigins?.map((origin, index) => {
        const fieldId = fields[index]?.id
        const prefix = originPrefixes[fieldId] || "https://"
        const value = origin.value.trim()

        // If prefix is wildcard and value doesn't start with *., add it
        if (prefix === "https://*." && !value.startsWith("*.")) {
          return { value: `*.${value}` }
        }

        return origin
      }) || []

      onSubmit({
        ...data,
        allowedOrigins: processedOrigins,
        selectedPlan,
        billingInterval
      })
    })()
  }

  return (
    <form
      id="create-project-form"
      onSubmit={handleFormSubmit}
      className={className}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col gap-6">
          {error && (
            <div className="text-destructive text-sm text-center">{error}</div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {["Name", "Icon", "URLs", "Plan"].map((stepName, index) => (
              <React.Fragment key={index}>
                <span
                  className={cn(
                    "cursor-pointer transition-colors hover:text-foreground",
                    index === step && "font-semibold text-foreground"
                  )}
                  onClick={() => {
                    onStepChange(index as ProjectStep)
                  }}
                >
                  {index + 1}. {stepName}
                </span>
                {index < 3 && <ChevronRight size={12} />}
              </React.Fragment>
            ))}
          </div>

          {step === STEP_NAME && (
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">Project name *</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="name"
                      type="text"
                      placeholder="My Awesome Blog"
                      {...register("name")}
                    />

                    <InputGroupAddon align="inline-end">
                      {watch("name")?.length ?? 0}/{PROJECT_NAME_MAX_LENGTH}
                    </InputGroupAddon>
                  </InputGroup>
                  
                  {errors.name && (
                    <p className="text-destructive text-sm">
                      {errors.name.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="slug-preview">
                    Project slug
                  </FieldLabel>
                  
                  <InputGroup>
                    <InputGroupAddon align="inline-start">app.simplist.blog/</InputGroupAddon>
                    <InputGroupInput
                      id="slug-preview"
                      type="text"
                      disabled
                      value={watch("name") ? generateSlug(watch("name")) : ""}
                      placeholder="my-awesome-blog"
                      className={cn({
                        "border-destructive text-destructive": watch("name") && isReservedSlug(generateSlug(watch("name")))
                      })}
                    />
                  </InputGroup>
                  
                  {watch("name") && isReservedSlug(generateSlug(watch("name"))) && (
                    <p className="text-destructive text-sm">
                      This slug is reserved. Please choose a different project name.
                    </p>
                  )}
                </Field>
              </div>
            )}

            {step === STEP_ICON && (
              <>
                <Field>
                  <Item size="sm" variant="muted">
                    <ItemMedia
                      variant="icon"
                      className="size-8"
                      style={{
                        backgroundColor: getColorValue(watch("color") ?? "CYAN"),
                        color: getIconTextColorWithBackgroundColorOf(watch("color") ?? "CYAN")
                      }}
                    >
                      <IconRender name={i(watch("icon") ?? "building-2")} />
                    </ItemMedia>

                    <ItemContent>
                      <ItemTitle>Preview</ItemTitle>
                      <ItemDescription className="text-xs line-clamp-2">
                        You can upload a custom avatar / logo from your computer later in the project settings.
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </Field>

                <div className="flex flex-col gap-3">
                    <Field>
                      <FieldLabel className="text-sm">Icon</FieldLabel>

                      <IconPicker
                        value={i(watch("icon") ?? "building-2")}
                        onValueChange={(value) => {
                          form.setValue("icon", value, { shouldDirty: true })
                        }}
                        className="w-full"
                        dialog
                      />
                    </Field>

                    <Field>
                      <FieldLabel className="text-sm">Color</FieldLabel>
                      <ColorSelector
                        value={watch("color") ? c(watch("color")!) : null}
                        onValueChange={(value) => {
                        form.setValue("color", value === null ? undefined : value, { shouldDirty: true })
                        }}
                        className="w-full"
                        dialog
                      />
                  </Field>
                </div>
              </>
            )}
            
            {step === STEP_URLS && (
              <>
                <Field>
                  <FieldLabel htmlFor="baseUrl">URL</FieldLabel>
            
                  <Input
                    id="baseUrl"
                    type="url"
                    placeholder="https://acme.com"
                    {...register("baseUrl")}
                  />
            
                  <FieldDescription className="text-xs">
                    The base URL of your site. Used to pre-fill links in webhooks and analytics.
                  </FieldDescription>
            
                  {errors.baseUrl && (
                    <p className="text-destructive text-sm">
                      {errors.baseUrl.message}
                    </p>
                  )}
                </Field>
            
                <Field>
                  <FieldLabel htmlFor="articleUrlPattern">
                    URL pattern (optional)
                    <InfoTooltip
                      content="Webhook sent with {{url}} variable will contain the full URL of the article."
                      showBrackets
                    />
                  </FieldLabel>
            
                  <InputGroup>
                    <InputGroupAddon>
                      {watch("baseUrl") || "https://acme.com/"}
                    </InputGroupAddon>
            
                    <InputGroupInput
                      id="articleUrlPattern"
                      placeholder="/posts/{slug}"
                      {...register("articleUrlPattern")}
                    />
                  </InputGroup>
            
                  <FieldDescription className="text-xs">
                    Used to generate article URLs.
                  </FieldDescription>
            
                  {errors.articleUrlPattern && (
                    <p className="text-destructive text-sm">
                      {errors.articleUrlPattern.message}
                    </p>
                  )}
                </Field>
            
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>
                      Allowed Origins
                      <InfoTooltip
                        content="API requests from these domains will be allowed. Leave empty to allow all origins."
                      />
                    </FieldLabel>

                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="w-fit h-fit text-[11px]"
                      onClick={() => append({ value: "" })}
                    >
                      <Plus className="size-3.5" />
                      Add Origin
                    </Button>
                  </div>
            
                  {fields.map((field, index) => (
                    <InputGroup key={field.id}>
                      <Select
                        value={originPrefixes[field.id] || "https://"}
                        onValueChange={(value: "https://" | "https://*.") => {
                          setOriginPrefixes(prev => ({ ...prev, [field.id]: value }))
                        }}
                      >
                        <InputGroupSelect>
                          <SelectValue />
                        </InputGroupSelect>
                        <SelectContent>
                          <SelectItem value="https://">https://</SelectItem>
                          <SelectItem value="https://*.">https://*.</SelectItem>
                        </SelectContent>
                      </Select>

                      <InputGroupInput
                        placeholder="yourdomain.com"
                        {...register(`allowedOrigins.${index}.value`)}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            remove(index)
                            setOriginPrefixes(prev => {
                              const newPrefixes = { ...prev }
                              delete newPrefixes[field.id]
                              return newPrefixes
                            })
                          }}
                        >
                          <X />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  ))}

                  {fields.length === 0 && (
                    <div className="flex justify-center items-center text-center text-muted-foreground text-xs border border-dashed border-input rounded-md p-4 h-16">
                      Leave empty to allow all origins.                 
                    </div>
                  )}

                  {errors.allowedOrigins && (
                    <p className="text-destructive text-sm">
                      {errors.allowedOrigins.message}
                    </p>
                  )}
                </Field>
              </>
            )}            

            {step === STEP_PLAN && (
              <div>
                <FieldSet>
                  <FieldContent>
                    <FieldTitle>
                      Choose your plan
                    </FieldTitle>

                    <FieldDescription>
                      Start with our starter plan or upgrade to pro for more advanced features.
                    </FieldDescription>
                  </FieldContent>
                  
                  <div className="flex justify-end">
                    <BillingToggle
                      value={billingInterval}
                      onValueChange={(value) => setBillingInterval(value)}
                      showSavings={true}
                    />
                  </div>

                  <RadioGroup
                    className="-space-y-px gap-0 rounded-md shadow-xs"
                    value={selectedPlan}
                    onValueChange={(value: PlanIds) => setSelectedPlan(value)}
                  >
                    <div className="relative flex flex-col gap-2.5 border border-input p-4 outline-none first:rounded-t-md last:rounded-b-md has-data-[state=checked]:z-10 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            aria-describedby="plan-starter-description"
                            className="after:absolute after:inset-0"
                            id="plan-starter"
                            value="STARTER"
                          />

                          <Label
                            className="inline-flex items-start"
                            htmlFor="plan-starter"
                          >
                            {SUBSCRIPTION_PLANS.STARTER.name}
                          </Label>
                        </div>

                        <div className="text-xs leading-[inherit] px-2 py-px bg-primary/10 rounded-md text-primary">
                          {SUBSCRIPTION_PLANS.STARTER.prices[0].displayAmount}
                        </div>
                      </div>

                      <p className="text-muted-foreground text-xs" id="plan-starter-description">
                        {SUBSCRIPTION_PLANS.STARTER.description}
                      </p>
                    </div>

                    <div className="relative flex flex-col gap-1.5 border border-input p-4 outline-none first:rounded-t-md last:rounded-b-md has-data-[state=checked]:z-10 has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/15">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            aria-describedby="plan-pro-description"
                            className="after:absolute after:inset-0"
                            id="plan-pro"
                            value="PRO"
                          />

                          <Label
                            className="inline-flex items-start"
                            htmlFor="plan-pro"
                          >
                            {SUBSCRIPTION_PLANS.PRO.name}
                            {billingInterval === 'yearly' && SUBSCRIPTION_PLANS.PRO.prices[1].savings && (
                              <span className="font-normal text-xs leading-[inherit] text-primary">
                                ({SUBSCRIPTION_PLANS.PRO.prices[1].savings})
                              </span>
                            )}
                          </Label>
                        </div>

                        <div className="text-xs leading-[inherit] px-2 py-px bg-primary/10 rounded-md text-primary">
                          {SUBSCRIPTION_PLANS.PRO.prices[billingInterval === "monthly" ? 0 : 1].displayAmount}/month
                        </div>
                      </div>
                      <p
                        className="text-muted-foreground text-xs"
                        id="plan-pro-description"
                      >
                        {SUBSCRIPTION_PLANS.PRO.description}
                      </p>
                    </div>
                  </RadioGroup>
                </FieldSet>
              </div>
            )}
        </div>
      </FieldGroup>
    </form>
  )
})