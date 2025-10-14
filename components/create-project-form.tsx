"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/sonner"
import { Textarea } from "@/components/ui/textarea"
import { createProject } from "@/lib/actions/projects"
import { cn, generateSlug } from "@/lib/utils"
import { CreateProjectInput, createProjectSchema } from "@/lib/validations/project"
import { Spinner } from "./ui/spinner"

export function CreateProjectForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  const onSubmit = async (data: CreateProjectInput) => {
    setError("")
    const slug = generateSlug(data.name)

    toast.promise(
      createProject({ name: data.name, slug, description: data.description }),
      {
        loading: "Creating project...",
        success: () => {
          router.push("/dashboard")
          router.refresh()
          return "Project created"
        },
        error: (err: any) => {
          const message = err?.message || "Failed to create project"
          setError(message)
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
