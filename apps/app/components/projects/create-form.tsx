"use client"

import { createProject } from "@/lib/actions/projects"
import { cn, generateSlug } from "@/lib/utils"
import { CreateProjectInput, createProjectSchema, isReservedSlug } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@simplist/ui/components/input-group"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"

export const CreateProjectForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      allowedOrigins: [],
      color: "YELLOW",
      icon: "building-2"
    },
  })

  const { register, control, handleSubmit, watch, formState: { errors } } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowedOrigins"
  })

  const onSubmit = async (data: CreateProjectInput) => {
    setError("")
    setIsSubmitting(true)
    const slug = generateSlug(data.name)

    // Check if slug is reserved
    if (isReservedSlug(slug)) {
      setError(`The name "${data.name}" generates a reserved slug. Please choose a different name.`)
      setIsSubmitting(false)
      return
    }

    toast.promise(
      createProject({
        name: data.name,
        slug,
        icon: data.icon,
        color: data.color,
        allowedOrigins: data.allowedOrigins || []
      }), {
        loading: "Creating project...",
        success: (project) => {
          router.push(`/${project.slug}`)
          router.refresh()
          setIsSubmitting(false)
          return "Project created"
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : "Failed to create project"
          setError(message)
          setIsSubmitting(false)
          return message
        },
      }
    )
  }

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Your First Project</CardTitle>
          <CardDescription>
            Projects help you organize your blog articles
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col gap-4">
                {error && (
                  <div className="text-destructive text-sm text-center">{error}</div>
                )}

                <Field>
                  <FieldLabel htmlFor="name">Project Name *</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="My Awesome Blog"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm mt-1">{errors.name.message}</p>
                  )}
                </Field>

                <Field>
                  <FieldLabel>Allowed Origins (Optional)</FieldLabel>
                  <div className="space-y-2">
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

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ value: "" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Origin
                    </Button>

                    <p className="text-muted-foreground text-sm">
                      Add domains that can use your API. Leave empty to allow all origins.
                    </p>

                    {errors.allowedOrigins && (
                      <p className="text-destructive text-sm">{errors.allowedOrigins.message}</p>
                    )}
                  </div>
                </Field>

                <Field>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : "Create Project"}
                  </Button>
                </Field>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
