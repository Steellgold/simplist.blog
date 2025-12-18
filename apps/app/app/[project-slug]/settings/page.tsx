"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { CompactLanguageSelector } from "@/components/ui/language-selector"
import { MiniBadge } from "@/components/ui/mini-badge"
import { useProject } from "@/hooks/use-project-context"
import { deleteProject, updateProjectSettings } from "@/lib/actions/projects"
import { UpdateProjectSettingsInput, updateProjectSettingsSchema } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@simplist/ui/components/alert-dialog"
import { Button } from "@simplist/ui/components/button"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@simplist/ui/components/card"
import { ColorSelector } from "@simplist/ui/components/color-selector"
import { FieldDescription, FieldError, FieldLabel } from "@simplist/ui/components/field"
import { IconPicker } from "@simplist/ui/components/icon-picker"
import { Input } from "@simplist/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@simplist/ui/components/input-group"
import { Kbd } from "@simplist/ui/components/kbd"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { c } from "@simplist/ui/lib/color"
import { i } from "@simplist/ui/lib/icons.enum"
import { Camera, Palette, Plus, Trash2, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"


const SettingsPage = () => {
  const { currentProject, updateProject, currentMember } = useProject()
  const router = useRouter()
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

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
      color: c(currentProject?.color || "CYAN"),
      avatarUrl: currentProject?.avatarUrl || null,
      defaultLanguage: currentProject?.defaultLanguage || "en",
      allowedOrigins: currentProject?.allowedOrigins?.map((origin: string) => ({
        value: origin.replace("https://", "")
      })) || [],
      baseUrl: currentProject?.baseUrl || null,
      articleUrlPattern: currentProject?.articleUrlPattern || "/blog/{slug}",
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
  const hasUrlChanges = dirtyFields.baseUrl || dirtyFields.articleUrlPattern
  const canDeleteProject = Boolean(
    (currentProject as any)?.memberRole?.canDeleteProject ||
    (currentProject as any)?.isOwner ||
    (currentMember as any)?.role?.canDeleteProject
  )

  const saveSettings = async (data: UpdateProjectSettingsInput, section: string) => {
    setSavingSection(section)
    const oldSlug = currentProject.slug

    let payload: Parameters<typeof updateProjectSettings>[1] = {
      name: currentProject.name,
      slug: currentProject.slug,
      icon: i(currentProject.icon),
      color: currentProject.color,
      avatarUrl: currentProject.avatarUrl,
      defaultLanguage: currentProject.defaultLanguage,
      allowedOrigins: currentProject.allowedOrigins?.map((origin: string) => ({
        value: origin.replace("https://", "")
      })) || [],
      baseUrl: currentProject.baseUrl || null,
      articleUrlPattern: currentProject.articleUrlPattern || "/blog/{slug}",
    }

    switch (section) {
      case "name":
        payload.name = data.name
        break
      case "slug":
        payload.slug = data.slug
        break
      case "icon-color":
        // Pending file = Upload avatar
        let uploadedAvatarUrl = data.avatarUrl
        if (pendingAvatarFile) {
          try {
            const formData = new FormData()
            formData.append("file", pendingAvatarFile)
            formData.append("projectId", currentProject.id)

            const response = await fetch("/api/uploads/avatar/project", {
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
        payload.icon = data.icon
        payload.color = data.color
        payload.avatarUrl = uploadedAvatarUrl
        break
      case "language":
        payload.defaultLanguage = data.defaultLanguage
        break
      case "origins":
        payload.allowedOrigins = data.allowedOrigins || []
        break
      case "url":
        payload.baseUrl = data.baseUrl ?? null
        payload.articleUrlPattern = data.articleUrlPattern || "/blog/{slug}"
        break
    }

    toast.promise(
      updateProjectSettings(currentProject.id, payload), {
        loading: "Saving settings...",
        success: (project) => {
          setSavingSection(null)
          updateProject(project)

          // Only reset the specific fields that were saved to clear dirty state
          switch (section) {
            case "name":
              form.resetField("name", { defaultValue: project.name })
              break
            case "slug":
              form.resetField("slug", { defaultValue: project.slug })
              break
            case "icon-color":
              form.resetField("icon", { defaultValue: i(project.icon || "building-2") })
              form.resetField("color", { defaultValue: project.color || "CYAN" })
              form.resetField("avatarUrl", { defaultValue: project.avatarUrl || null })
              break
            case "language":
              form.resetField("defaultLanguage", { defaultValue: project.defaultLanguage })
              break
            case "origins":
              form.resetField("allowedOrigins", {
                defaultValue: project.allowedOrigins?.map((origin: string) => ({
                  value: origin.replace("https://", "")
                })) || []
              })
              break
            case "url":
              form.resetField("baseUrl", { defaultValue: project.baseUrl || null })
              form.resetField("articleUrlPattern", { defaultValue: project.articleUrlPattern || "/blog/{slug}" })
              break
          }

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
  const deleteDisabled = !canDeleteProject || deleteConfirm.trim() !== currentProject.slug || isDeleting

  const handleDeleteProject = async () => {
    if (!currentProject) return
    setIsDeleting(true)
    toast.promise(
      deleteProject(currentProject.id), {
        loading: "Deleting project...",
        success: () => {
          setIsDeleting(false)
          router.push("/")
          return "Project deleted permanently"
        },
        error: (err) => {
          setIsDeleting(false)
          const message = err instanceof Error ? err.message : "Failed to delete project"
          return message
        }
      }
    )
  }

  return (
    <PageLayout
      title="Settings"
      description={`Manage settings for your ${currentProject.name} project`}
      centered
    >
      <div className="space-y-6">
        {/* Project Name Card */}
        <Card variant="form">
          <CardHeader>
            <FieldLabel htmlFor="name" className="text-base font-medium">Project Name</FieldLabel>
            <FieldDescription className="mt-1">The display name of your project.</FieldDescription>
          </CardHeader>

          <CardContent>
            <Input
              id="name"
              {...register("name")}
              disabled={isDisabled}
              className="max-w-md"
            />

            {errors.name && <FieldError>{errors.name.message}</FieldError>}
          </CardContent>

          <CardFooter>
            <p className="text-sm text-muted-foreground">Maximum 64 characters.</p>
            <Button
              type="button"
              disabled={isDisabled || !hasNameChanges}
              onClick={handleSubmit((data) => saveSettings(data, "name"))}
            >
              {savingSection === "name" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Project Slug Card */}
        <Card variant="form">
          <CardHeader>
            <FieldLabel htmlFor="slug" className="text-base font-medium">Project Slug</FieldLabel>
            <FieldDescription className="mt-1">
              Your unique project identifier used in URLs and API endpoints.
            </FieldDescription>
          </CardHeader>

          <CardContent>
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

          <CardFooter>
            <p className="text-sm text-muted-foreground">Lowercase letters, numbers, and hyphens only.</p>
            <Button
              type="button"
              disabled={isDisabled || !hasSlugChanges}
              onClick={handleSubmit((data) => saveSettings(data, "slug"))}
            >
              {savingSection === "slug" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Project Icon & Color Card */}
        <Card variant="form">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Project Display</FieldLabel>
            <FieldDescription className="mt-1">Choose how your project is displayed in the app.</FieldDescription>

            <CardAction>
              <ButtonGroup>
                <Button
                  type="button"
                  variant={displayType === "icon" ? "default" : "secondary"}
                  onClick={() => setDisplayType("icon")}
                >
                  <Palette />
                </Button>
                <Button
                  type="button"
                  variant={displayType === "avatar" ? "default" : "secondary"}
                  onClick={() => setDisplayType("avatar")}
                >
                  <Camera />
                </Button>
              </ButtonGroup>
            </CardAction>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {displayType === "icon" ? (
                <div>
                  <FieldLabel className="text-sm mb-2">Icon & Color</FieldLabel>
                  <div className="flex gap-2 max-w-md">
                    <div>
                      <IconPicker
                        value={i(watch("icon") ?? "building-2")}
                        onValueChange={(value) => {
                          form.setValue("icon", value, { shouldDirty: true })
                        }}
                        disabled={isDisabled}
                        className="flex-1 w-full"
                        dialog={true}
                      />
                    </div>

                    <ColorSelector
                      value={watch("color") ? c(watch("color")!) : null}
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

          <CardFooter>
            <p className="text-sm text-muted-foreground">Avatar will override icon if uploaded.</p>
            <Button
              type="button"
              disabled={isDisabled || !hasIconColorChanges}
              onClick={handleSubmit((data) => saveSettings(data, "icon-color"))}
            >
              {savingSection === "icon-color" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Default Language Card */}
        <Card variant="form">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FieldLabel htmlFor="defaultLanguage" className="text-base font-medium">Default Language</FieldLabel>
              {currentProject?.subscriptionTier === "STARTER" && (
                <MiniBadge tier="PRO" size="sm" />
              )}
            </div>

            <FieldDescription className="mt-1">The default language for new articles and language variant system.</FieldDescription>
          </CardHeader>

          <CardContent>
            <CompactLanguageSelector
              value={watch("defaultLanguage")}
              onValueChange={(value) => {
                form.setValue("defaultLanguage", value, { shouldValidate: true, shouldDirty: true })
              }}
              disabled={currentProject?.subscriptionTier === "STARTER" || isDisabled}
              dialog={true}
            />

            {errors.defaultLanguage && <FieldError>{errors.defaultLanguage.message}</FieldError>}
          </CardContent>

          <CardFooter>
            <p className="text-sm text-muted-foreground">Affects translations and date formatting.</p>
            <Button
              type="button"
              disabled={isDisabled || !hasLanguageChanges}
              onClick={handleSubmit((data) => saveSettings(data, "language"))}
            >
              {savingSection === "language" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Allowed Origins Card */}
        <Card variant="form">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Allowed Origins</FieldLabel>
            <FieldDescription className="mt-1">Domains that can access your project (CORS).</FieldDescription>
          </CardHeader>

          <CardContent>
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
                onClick={() => append({ value: "" })}
                disabled={isDisabled}
              >
                <Plus />
                Add Origin
              </Button>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-muted-foreground">By default, all origins are allowed.</p>
            <Button
              type="button"
              disabled={isDisabled || !hasOriginsChanges}
              onClick={handleSubmit((data) => saveSettings(data, "origins"))}
            >
              {savingSection === "origins" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        <Card variant="form">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Article URL</FieldLabel>
            <FieldDescription className="mt-1">
              Configure the base URL and pattern for article links in webhooks. Leave empty to use custom URLs in templates.
            </FieldDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4 max-w-md">
              <div>
                <FieldLabel htmlFor="baseUrl" className="text-sm mb-2">Base URL</FieldLabel>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://monblog.com"
                  {...register("baseUrl")}
                  disabled={isDisabled}
                />
                <FieldDescription className="mt-1">
                  The base URL of your blog (optional)
                </FieldDescription>
                {errors.baseUrl && <FieldError>{errors.baseUrl.message}</FieldError>}
              </div>

              <div>
                <FieldLabel htmlFor="articleUrlPattern" className="text-sm mb-2">URL Pattern</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>{watch("baseUrl") || "https://example.com"}</InputGroupAddon>
                  <InputGroupInput
                    id="articleUrlPattern"
                    placeholder="/blog/{slug}"
                    {...register("articleUrlPattern")}
                    disabled={isDisabled}
                  />
                </InputGroup>
                <FieldDescription className="mt-1">
                  Pattern for article URLs. Must include {"{slug}"}. Examples: /blog/{"{slug}"}, /articles/{"{slug}"}
                </FieldDescription>
                {errors.articleUrlPattern && <FieldError>{errors.articleUrlPattern.message}</FieldError>}
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-sm text-muted-foreground">
              {watch("baseUrl") && watch("articleUrlPattern")
                ? `Articles will use: ${watch("baseUrl")}${watch("articleUrlPattern")}`
                : "Configure to auto-generate article URLs in webhooks"}
            </p>
            <Button
              type="button"
              disabled={isDisabled || !hasUrlChanges}
              onClick={handleSubmit((data) => saveSettings(data, "url"))}
            >
              {savingSection === "url" ? <><Spinner /> Saving...</> : "Save"}
            </Button>
          </CardFooter>
        </Card>

        {/* Danger Zone */}
        <Card variant="form-danger">
          <CardHeader>
            <FieldLabel className="text-base font-medium">Danger Zone</FieldLabel>
            <FieldDescription className="mt-1 text-sm text-muted-foreground">
              Permanently delete this project and all associated data. This action cannot be undone.
            </FieldDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <FieldLabel className="text-sm">Type the project slug to confirm</FieldLabel>
              <Input
                placeholder={currentProject.slug}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                disabled={isDeleting}
                className="max-w-md"
              />
            </div>

            {!canDeleteProject && (
              <p className="text-sm text-muted-foreground">
                You need the <Kbd>Delete project</Kbd> permission <Kbd>OWNER</Kbd> to delete this project.
              </p>
            )}
          </CardContent>

          <CardFooter>
            <div className="text-sm text-muted-foreground">
              This will permanently delete the project and all associated data.
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleteDisabled}
                >
                  {isDeleting ? <Spinner /> : <Trash2 />}
                  {isDeleting ? "Deleting..." : "Delete project"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleteDisabled}
                    onClick={handleDeleteProject}
                  >
                    {isDeleting ? <Spinner /> : "Confirm delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </PageLayout>
  )
}

export default SettingsPage