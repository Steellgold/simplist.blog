"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { CompactLanguageSelector } from "@/components/ui/language-selector"
import { MiniBadge } from "@/components/ui/mini-badge"
import { useProject } from "@/hooks/use-project-context"
import { updateProjectSettings } from "@/lib/actions/projects"
import { type LanguageCode } from "@/lib/types/languages"
import { UpdateProjectSettingsInput, updateProjectSettingsSchema } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@simplist/ui/components/card"
import { ColorSelector } from "@simplist/ui/components/color-selector"
import { FieldDescription, FieldError, FieldLabel } from "@simplist/ui/components/field"
import { IconPicker } from "@simplist/ui/components/icon-picker"
import { Input } from "@simplist/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@simplist/ui/components/input-group"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { ColorsEnumType } from "@simplist/ui/lib/color"
import { i, IconsEnumType } from "@simplist/ui/lib/icons.enum"
import { Camera, Palette, Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"


const SettingsPage = () => {
  const { currentProject, updateProject } = useProject()
  const router = useRouter()
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)

  // State to track display type: "avatar" if avatarUrl exists, otherwise "icon"
  const [displayType, setDisplayType] = useState<"avatar" | "icon">(
    currentProject?.avatarUrl ? "avatar" : "icon"
  )

  const form = useForm<UpdateProjectSettingsInput>({
    resolver: zodResolver(updateProjectSettingsSchema),
    defaultValues: {
      name: currentProject?.name || "",
      slug: currentProject?.slug || "",
      icon: i(currentProject?.icon || "building-2"),
      color: currentProject?.color || "CYAN",
      avatarUrl: currentProject?.avatarUrl || null,
      defaultLanguage: currentProject?.defaultLanguage || "en",
      allowedOrigins: currentProject?.allowedOrigins?.map((origin: string) => ({
        value: origin.replace("https://", "")
      })) || []
    },
  })

  const { register, control, handleSubmit, formState: { errors, dirtyFields }, watch, reset } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowedOrigins"
  })

  if (!currentProject) return <EmptyProject />

  // Check if specific sections have changes
  const hasNameChanges = dirtyFields.name
  const hasSlugChanges = dirtyFields.slug
  const hasIconColorChanges = dirtyFields.icon || dirtyFields.color || dirtyFields.avatarUrl
  const hasLanguageChanges = dirtyFields.defaultLanguage
  const hasOriginsChanges = dirtyFields.allowedOrigins

  const saveSettings = async (data: UpdateProjectSettingsInput, section: string) => {
    setSavingSection(section)
    const oldSlug = currentProject.slug

    // Upload avatar if there's a pending file
    let uploadedAvatarUrl = data.avatarUrl
    if (pendingAvatarFile) {
      try {
        const formData = new FormData()
        formData.append("file", pendingAvatarFile)
        formData.append("projectId", currentProject.id)
        formData.append("type", "avatar")

        const response = await fetch("/api/uploads", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        const uploadData = await response.json()
        uploadedAvatarUrl = uploadData.publicUrl
        setPendingAvatarFile(null)
      } catch (error) {
        setSavingSection(null)
        toast.error(error instanceof Error ? error.message : "Failed to upload avatar")
        return
      }
    }

    toast.promise(
      updateProjectSettings(currentProject.id, {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        avatarUrl: uploadedAvatarUrl,
        defaultLanguage: data.defaultLanguage,
        allowedOrigins: data.allowedOrigins || []
      }), {
        loading: "Saving settings...",
        success: (project) => {
          setSavingSection(null)
          updateProject(project)

          // Reset form with new values to clear dirty state
          reset({
            name: project.name,
            slug: project.slug,
            icon: i(project.icon || "building-2"),
            color: project.color || "CYAN",
            avatarUrl: project.avatarUrl || null,
            defaultLanguage: project.defaultLanguage,
            allowedOrigins: project.allowedOrigins?.map((origin: string) => ({
              value: origin.replace("https://", "")
            })) || []
          })

          // If slug changed, redirect to new URL
          if (project.slug !== oldSlug) {
            router.push(`/${project.slug}/settings`)
          }

          return "Settings saved successfully"
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to save settings"
          setSavingSection(null)
          return message
        },
      }
    )
  }

  const isDisabled = savingSection !== null

  return (
    <PageLayout
      title="Settings"
      description={`Manage settings for your ${currentProject.name} project`}
      centered
    >
      <div className="space-y-6">
        {/* Project Name Card */}
        <Card className="pb-0">
          <CardHeader>
            <FieldLabel htmlFor="name" className="text-base font-medium">Project Name</FieldLabel>
            <FieldDescription className="mt-1">The display name of your blog project.</FieldDescription>
          </CardHeader>

          <CardContent className="py-2.5">
            <Input
              id="name"
              {...register("name")}
              disabled={isDisabled}
              className="max-w-md"
            />

            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </CardContent>

          <CardFooter className="flex justify-between bg-muted/50 rounded-b-xl py-2.5 border-t">
            <p className="text-sm text-muted-foreground">Maximum 64 characters.</p>
            <Button
              type="button"
              size="sm"
              disabled={isDisabled || !hasNameChanges}
              onClick={handleSubmit((data) => saveSettings(data, "name"))}
            >
              {savingSection === "name" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Project Slug Card */}
        <Card className="pb-0">
          <CardHeader>
            <FieldLabel htmlFor="slug" className="text-base font-medium">Project Slug</FieldLabel>
            <FieldDescription className="mt-1">
              Your unique project identifier used in URLs and API endpoints.
            </FieldDescription>
          </CardHeader>

          <CardContent className="py-2.5">
            <InputGroup className="max-w-md">
              <InputGroupAddon>https://simplist.blog/</InputGroupAddon>
              <InputGroupInput
                id="slug"
                placeholder="my-project"
                {...register("slug")}
                disabled={isDisabled}
              />
            </InputGroup>

            {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
          </CardContent>

          <CardFooter className="flex justify-between bg-muted/50 rounded-b-xl py-2.5 border-t">
            <p className="text-sm text-muted-foreground">Lowercase letters, numbers, and hyphens only.</p>
            <Button
              type="button"
              size="sm"
              disabled={isDisabled || !hasSlugChanges}
              onClick={handleSubmit((data) => saveSettings(data, "slug"))}
            >
              {savingSection === "slug" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Project Icon & Color Card */}
        <Card className="pb-0">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Project Display</FieldLabel>
            <FieldDescription className="mt-1">Choose how your project is displayed in the app.</FieldDescription>

            <CardAction>
              <ButtonGroup>
                <Button
                  type="button"
                  variant={displayType === "icon" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setDisplayType("icon")}
                >
                  <Palette />
                </Button>
                <Button
                  type="button"
                  variant={displayType === "avatar" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setDisplayType("avatar")}
                >
                  <Camera />
                </Button>
              </ButtonGroup>
            </CardAction>
          </CardHeader>

          <CardContent className="py-2.5">
            <div className="space-y-4">
              {displayType === "icon" ? (
                <div>
                  <FieldLabel className="text-sm mb-2">Icon & Color</FieldLabel>
                  <div className="flex gap-2 max-w-md">
                    <div>
                      <IconPicker
                        value={watch("icon") as IconsEnumType}
                        onValueChange={(value) => {
                          form.setValue("icon", value, { shouldDirty: true })
                        }}
                        disabled={isDisabled}
                        className="flex-1 w-full"
                        dialog={true}
                      />
                    </div>

                    <ColorSelector
                      value={watch("color") as ColorsEnumType | null}
                      onValueChange={(value) => {
                        form.setValue("color", value === null ? undefined : value, { shouldDirty: true })
                      }}
                      disabled={isDisabled}
                      className="flex-1 w-full"
                      dialog={true}
                    />
                  </div>

                  {errors.icon && <FieldError>{errors.icon.message}</FieldError>}
                  {errors.color && <FieldError>{errors.color.message}</FieldError>}
                </div>
              ) : (
                <div>
                  <AvatarUpload
                    projectId={currentProject.id}
                    currentAvatarUrl={watch("avatarUrl")}
                    onFileSelect={(file) => {
                      setPendingAvatarFile(file)
                      if (file) {
                        form.setValue("avatarUrl", "pending", { shouldDirty: true })
                        setDisplayType("avatar")
                      }
                    }}
                    onRemove={() => {
                      setPendingAvatarFile(null)
                      form.setValue("avatarUrl", null, { shouldDirty: true })
                      setDisplayType("icon")
                    }}
                    disabled={isDisabled}
                  />
                  {errors.avatarUrl && <FieldError>{errors.avatarUrl.message}</FieldError>}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-muted/50 rounded-b-xl py-2.5 border-t">
            <p className="text-sm text-muted-foreground">Avatar will override icon if uploaded.</p>
            <Button
              type="button"
              size="sm"
              disabled={isDisabled || !hasIconColorChanges}
              onClick={handleSubmit((data) => saveSettings(data, "icon-color"))}
            >
              {savingSection === "icon-color" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Default Language Card */}
        <Card className="pb-0">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FieldLabel htmlFor="defaultLanguage" className="text-base font-medium">Default Language</FieldLabel>
              {currentProject?.subscriptionTier === "STARTER" && (
                <MiniBadge tier="PRO" size="sm" />
              )}
            </div>

            <FieldDescription className="mt-1">The default language for new articles and language variant system.</FieldDescription>
          </CardHeader>

          <CardContent className="py-2.5">
            <CompactLanguageSelector
              value={watch("defaultLanguage") as LanguageCode}
              onValueChange={(value) => {
                form.setValue("defaultLanguage", value, { shouldValidate: true, shouldDirty: true })
              }}
              disabled={currentProject?.subscriptionTier === "STARTER" || isDisabled}
              dialog={true}
            />

            {errors.defaultLanguage && <FieldError>{errors.defaultLanguage.message}</FieldError>}
          </CardContent>

          <CardFooter className="flex justify-between bg-muted/50 rounded-b-xl py-2.5 border-t">
            <p className="text-sm text-muted-foreground">Affects translations and date formatting.</p>
            <Button
              type="button"
              size="sm"
              disabled={isDisabled || !hasLanguageChanges}
              onClick={handleSubmit((data) => saveSettings(data, "language"))}
            >
              {savingSection === "language" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Allowed Origins Card */}
        <Card className="pb-0">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Allowed Origins</FieldLabel>
            <FieldDescription className="mt-1">Domains that can access your project (CORS).</FieldDescription>
          </CardHeader>

          <CardContent className="py-2.5">
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id}>
                  <InputGroup>
                    <InputGroupAddon>https://</InputGroupAddon>
                    <InputGroupInput
                      placeholder="yourdomain.com or *.yourdomain.com"
                      {...register(`allowedOrigins.${index}.value`)}
                      disabled={isDisabled}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="outline"
                        onClick={() => remove(index)}
                        disabled={isDisabled}
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

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ value: "" })}
                disabled={isDisabled}
              >
                <Plus />
                Add Origin
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between bg-muted/50 rounded-b-xl py-2.5 border-t">
            <p className="text-sm text-muted-foreground">By default, all origins are allowed.</p>
            <Button
              type="button"
              size="sm"
              disabled={isDisabled || !hasOriginsChanges}
              onClick={handleSubmit((data) => saveSettings(data, "origins"))}
            >
              {savingSection === "origins" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}

export default SettingsPage
