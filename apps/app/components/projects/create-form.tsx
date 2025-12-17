"use client"

import { generateSlug } from "@/lib/utils"
import { CreateProjectInput, createProjectSchema, isReservedSlug, PROJECT_NAME_MAX_LENGTH, ProjectStep, STEP_ICON, STEP_NAME, STEP_PLAN, STEP_URLS } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlanIds, SUBSCRIPTION_PLANS, SubscriptionInterval } from "@simplist/limits"
import { BillingToggle } from "@simplist/ui/components/billing-toggle"
import { Button } from "@simplist/ui/components/button"
import { ColorSelector } from "@simplist/ui/components/color-selector"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldTitle } from "@simplist/ui/components/field"
import { IconPicker } from "@simplist/ui/components/icon-picker"
import { Input } from "@simplist/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@simplist/ui/components/input-group"
import { Label } from "@simplist/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@simplist/ui/components/radio-group"
import { c } from "@simplist/ui/lib/color"
import { i } from "@simplist/ui/lib/icons.enum"
import { ChevronRight, Plus, X } from "lucide-react"
import { forwardRef, useImperativeHandle, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

type CreateProjectFormValues = z.infer<typeof createProjectSchema>

interface CreateProjectFormProps {
  className?: string
  step: ProjectStep
  onNext: () => void
  onBack: () => void
  onSubmit: (data: CreateProjectInput & { selectedPlan: PlanIds, billingInterval: SubscriptionInterval }) => void
  isSubmitting: boolean
  error: string
}

export const CreateProjectForm = forwardRef<
  { 
    validateStep: (step: number) => Promise<boolean>
    submitForm: () => void 
  },
  CreateProjectFormProps
>(({ className, step, onNext, onBack, onSubmit, isSubmitting, error, ...props }, ref) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanIds>("STARTER")
  const [billingInterval, setBillingInterval] = useState<SubscriptionInterval>("monthly")

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema) as any,
    defaultValues: {
      name: "",
      allowedOrigins: [],
      color: "YELLOW",
      icon: "building-2",
      baseUrl: null,
      articleUrlPattern: "/posts/{slug}",
    },
  })

  const { register, control, handleSubmit, watch, trigger, formState: { errors } } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowedOrigins"
  })

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
    submitForm: handleCreateProject
  }))

  const handleFormSubmit = (e: React.FormEvent) => e.preventDefault()

  const handleCreateProject = () => {
    handleSubmit((data) => {
      onSubmit({ ...data, selectedPlan, billingInterval })
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
            
            <span className={step === STEP_NAME ? "font-semibold text-foreground" : ""}>
              {STEP_NAME + 1}. Name
            </span>

            <ChevronRight size={12} />

            <span className={step === STEP_ICON ? "font-semibold text-foreground" : ""}>
              {STEP_ICON + 1}. Icon
            </span>

            <ChevronRight size={12} />

            <span className={step === STEP_URLS ? "font-semibold text-foreground" : ""}>
              {STEP_URLS + 1}. URLs
            </span>

            <ChevronRight size={12} />

            <span className={step === STEP_PLAN ? "font-semibold text-foreground" : ""}>
              {STEP_PLAN + 1}. Plan
            </span>
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
                  
                  <FieldDescription className="text-xs">
                    Used to generate the project slug automatically (you can change it later in Settings).
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="slug-preview">
                    Project slug
                  </FieldLabel>
                  
                  <InputGroup>
                    <InputGroupAddon>app.simplist.blog/</InputGroupAddon>
                    <InputGroupInput
                      id="slug-preview"
                      type="text"
                      disabled
                      value={watch("name") ? generateSlug(watch("name")) : ""}
                      placeholder="my-awesome-blog"
                      className={`bg-muted ${
                        watch("name") && isReservedSlug(generateSlug(watch("name"))) 
                          ? "border-destructive text-destructive" 
                          : ""
                      }`}
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
              <div className="space-y-4">
                <Field>
                  <FieldLabel className="text-sm">Project icon & color</FieldLabel>
                    <FieldDescription className="text-xs">
                      Choose an icon and a color to quickly identify your project in the sidebar.
                      You can upload a custom avatar / logo from your computer later in the project settings.
                    </FieldDescription>
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
              </div>
            )}

            {step === STEP_URLS && (
              <div className="space-y-4">
                <Field>
                  <FieldLabel htmlFor="baseUrl">Base URL (optional)</FieldLabel>
                  <Input
                    id="baseUrl"
                    type="url"
                    placeholder="https://monblog.com"
                    {...register("baseUrl")}
                  />
                    
                  <FieldDescription className="text-xs">
                    The base URL of your blog, used to pre-fill links in webhooks and analytics. You can leave this empty for now.
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
                  </FieldLabel>
                    
                  <InputGroup>
                    <InputGroupAddon>
                      {watch("baseUrl") || "https://example.com"}
                    </InputGroupAddon>
                      
                    <InputGroupInput
                      id="articleUrlPattern"
                      placeholder="/posts/{slug}"
                      {...register("articleUrlPattern")}
                    />
                  </InputGroup>

                  <FieldDescription className="text-xs">
                    Pattern for article URLs. Should include {"{slug}"} (e.g. /posts/{"{slug}"}, /articles/{"{slug}"}). Leave empty to use defaults.
                  </FieldDescription>
                    
                  {errors.articleUrlPattern && (
                    <p className="text-destructive text-sm">
                      {errors.articleUrlPattern.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Allowed Origins (Optional)</FieldLabel>
                  <div className="space-y-2">
                    <div className={`space-y-2 ${fields.length > 3 ? 'max-h-32 overflow-y-auto pr-2' : ''}`}>
                      {fields.map((field, index) => (
                        <InputGroup key={field.id}>
                          <InputGroupAddon>https://</InputGroupAddon>

                          <InputGroupInput
                            placeholder="yourdomain.com or *.yourdomain.com"
                            {...register(`allowedOrigins.${index}.value`)}
                          />

                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => remove(index)}
                            >
                              <X />
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ value: "" })}
                      className="w-full"
                    >
                      <Plus />
                      Add Origin
                    </Button>

                    <p className="text-muted-foreground text-sm">
                      Add domains that can use your API. Leave empty to allow all origins.
                    </p>

                    {errors.allowedOrigins && (
                      <p className="text-destructive text-sm">
                        {errors.allowedOrigins.message}
                      </p>
                    )}
                  </div>
                </Field>
              </div>
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

                        <div className="text-muted-foreground text-xs leading-[inherit] px-2 py-px bg-primary/10 rounded-md text-primary">
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
                              <span className="font-normal text-muted-foreground text-xs leading-[inherit] text-primary">
                                ({SUBSCRIPTION_PLANS.PRO.prices[1].savings})
                              </span>
                            )}
                          </Label>
                        </div>

                        <div className="text-muted-foreground text-xs leading-[inherit] px-2 py-px bg-primary/10 rounded-md text-primary">
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