"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { createProject } from "@/lib/actions/projects"
import { cn, generateSlug } from "@/lib/utils"
import { CreateProjectInput, createProjectSchema } from "@/lib/validations/project"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Spinner } from "./ui/spinner"

export const CreateProjectForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      allowedOrigins: []
    },
  })

  const { register, control, handleSubmit, formState: { errors } } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowedOrigins"
  })

  const onSubmit = async (data: CreateProjectInput) => {
    setError("")
    setIsSubmitting(true)
    const slug = generateSlug(data.name)

    toast.promise(
      createProject({
        name: data.name,
        slug,
        description: data.description,
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
                  <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your blog project..."
                    rows={3}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
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
                            variant="outline"
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
