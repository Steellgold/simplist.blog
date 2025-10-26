"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { CompactLanguageSelector } from "@/components/ui/language-selector"
import { MiniBadge } from "@/components/ui/mini-badge"
import { toast } from "@/components/ui/sonner"
import { Spinner } from "@/components/ui/spinner"
import { TimezoneCombobox } from "@/components/ui/timezone-selector"
import { useProject } from "@/hooks/use-project-context"
import { updateProjectSettings } from "@/lib/actions/projects"
import { type LanguageCode } from "@/lib/types/languages"
import { UpdateProjectSettingsInput, updateProjectSettingsSchema } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"

const SettingsPage = () => {
  const { currentProject } = useProject()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<UpdateProjectSettingsInput>({
    resolver: zodResolver(updateProjectSettingsSchema),
    defaultValues: {
      name: currentProject?.name || "",
      slug: currentProject?.slug || "",
      // description: currentProject?.description || "",
      timezone: currentProject?.timezone || "UTC",
      defaultLanguage: currentProject?.defaultLanguage || "en",
      allowedOrigins: currentProject?.allowedOrigins?.map((origin: string) => ({
        value: origin.replace("https://", "")
      })) || []
    },
  })

  const { register, control, handleSubmit, formState: { errors }, watch } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowedOrigins"
  })

  if (!currentProject) return <EmptyProject />

  const onSubmit = async (data: UpdateProjectSettingsInput) => {
    setIsSubmitting(true)
    const oldSlug = currentProject.slug

    toast.promise(
      updateProjectSettings(currentProject.id, {
        name: data.name,
        slug: data.slug,
        description: data.description,
        timezone: data.timezone,
        defaultLanguage: data.defaultLanguage,
        allowedOrigins: data.allowedOrigins || []
      }), {
        loading: "Saving settings...",
        success: (project) => {
          setIsSubmitting(false)

          // If slug changed, redirect to new URL
          if (project.slug !== oldSlug) {
            router.push(`/${project.slug}/settings`)
          } else {
            router.refresh()
          }

          return "Settings saved successfully"
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to save settings"
          setIsSubmitting(false)
          return message
        },
      }
    )
  }

  return (
    <PageLayout
      title="Settings"
      description={`Manage settings for your ${currentProject.name} project`}
      centered
      actions={
        <Button
          type="submit"
          form="settings-form"
          size="sm"
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting
            ? <><Spinner /> Save changes</>
            : "Save changes"
          }
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <FieldGroup>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="name">Project Name</FieldLabel>
                  <FieldDescription>The display name of your blog project.</FieldDescription>
                </FieldContent>

                <Input id="name" {...register("name")} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <FieldSeparator />

              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="slug">Project Slug</FieldLabel>
                  <FieldDescription>
                    Your unique project identifier used in URLs and API endpoints.
                  </FieldDescription>
                </FieldContent>

                <InputGroup>
                  <InputGroupAddon>simplist.blog/</InputGroupAddon>
                  <InputGroupInput
                    id="slug"
                    placeholder="my-project"
                    {...register("slug")}
                  />
                </InputGroup>
                
                {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
              </Field>

              <FieldSeparator />

              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel htmlFor="timezone">Timezone</FieldLabel>
                  <FieldDescription>Select your timezone for scheduled publishing and analytics.</FieldDescription>
                </FieldContent>

                <TimezoneCombobox
                  defaultValue={currentProject.timezone}
                  onValueChange={(value) => form.setValue("timezone", value)}
                />

                {errors.timezone && <FieldError>{errors.timezone.message}</FieldError>}
              </Field>

              <FieldSeparator />

              <Field orientation="responsive">
                <FieldContent>
                  <div className="flex items-center gap-2">
                    <FieldLabel htmlFor="defaultLanguage">Default Language</FieldLabel>
                    {currentProject?.subscriptionTier === "STARTER" && (
                      <MiniBadge tier="PRO" size="sm" />
                    )}
                  </div>
                  <FieldDescription>The default language for new articles and language variant system.</FieldDescription>
                </FieldContent>

                <CompactLanguageSelector
                  value={watch("defaultLanguage") as LanguageCode}
                  onValueChange={(value) => {
                    form.setValue("defaultLanguage", value, { shouldValidate: true, shouldDirty: true })
                  }}
                  disabled={currentProject?.subscriptionTier === "STARTER"}
                />

                {errors.defaultLanguage && <FieldError>{errors.defaultLanguage.message}</FieldError>}
              </Field>

              <FieldSeparator />

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel>Allowed Origins</FieldLabel>
                  <FieldDescription>Add domains that can use your API. Leave empty to allow all origins.</FieldDescription>
                </FieldContent>

                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                  <Plus />
                  Add Origin
                </Button>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <InputGroup>
                      <InputGroupAddon>https://</InputGroupAddon>

                      <InputGroupInput
                        placeholder="yourdomain.com or *.yourdomain.com"
                        {...register(`allowedOrigins.${index}.value`)}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          variant="outline"
                          onClick={() => remove(index)}
                        >
                          <X />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>

                    {errors.allowedOrigins?.[index]?.value && (
                      <FieldError>
                        {errors.allowedOrigins[index]?.value?.message}
                      </FieldError>
                    )}
                  </div>
                ))}
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </PageLayout>
  )
}

export default SettingsPage
