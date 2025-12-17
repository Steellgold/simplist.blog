"use client"

import { CreateProjectForm } from "@/components/projects/create-form"
import { createProject } from "@/lib/actions/projects"
import { createCheckoutSession } from "@/lib/stripe/actions"
import { generateSlug } from "@/lib/utils"
import { CreateProjectInput, isReservedSlug, ProjectStep, STEP_NAME, STEP_PLAN } from "@/lib/validations/project"
import { PlanIds, SubscriptionInterval } from "@simplist/limits"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardFooter } from "@simplist/ui/components/card"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@simplist/ui/components/item"
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme"
import { toast } from "@simplist/ui/components/sonner"
import { useRouter } from "next/navigation"
import { useRef, useState } from "react"

export const CreateProjectPageClient = () => {
  const router = useRouter()
  const [step, setStep] = useState<ProjectStep>(STEP_NAME)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<{ 
    validateStep: (step: number) => Promise<boolean>
    submitForm: () => void 
  }>(null)

  const handleNext = async () => {
    if (formRef.current) {
      const isValid = await formRef.current.validateStep(step)
      if (!isValid) return
    }
    setStep((prev) => (prev < STEP_PLAN ? (prev + 1) as ProjectStep : prev))
  }
  
  const handleBack = () => {
    setStep((prev) => (prev > STEP_NAME ? (prev - 1) as ProjectStep : prev))
  }

  const handleSubmit = async (
    data: CreateProjectInput & {
      selectedPlan: PlanIds,
      billingInterval: SubscriptionInterval
    }
  ) => {
    setError("")
    setIsSubmitting(true)
    const slug = generateSlug(data.name)

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
        allowedOrigins: data.allowedOrigins || [],
        baseUrl: data.baseUrl || null,
        articleUrlPattern: data.articleUrlPattern || "/posts/{slug}",
      }), {
        loading: "Creating project...",
        success: async (project) => {
          setIsSubmitting(false)
          
          if (data.selectedPlan === "PRO") {
            try {
              const { url } = await createCheckoutSession(data.billingInterval, project.id)
              window.location.href = url
            } catch (error) {
              console.error("Failed to create checkout session:", error)
              router.push(`/${project.slug}/settings/billing`)
            }
          } else {
            router.push(`/${project.slug}`)
            router.refresh()
          }
          
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
    <div className="flex-1">
      <div className="fixed inset-0 bg-background/0 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <Card>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                    Onboarding
                  </Badge>

                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Create your first project
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md">
                      Give a name to your project, add an optional avatar and start connecting your blog. You can always refine the settings (URL, SEO, etc.) later in the project settings.
                    </p>
                  </div>

                  <ItemGroup>
                    <Item size="sm" variant="muted">
                      <ItemContent>
                        <ItemTitle>Create your project</ItemTitle>
                        <ItemDescription>
                          A project corresponds to a blog or a documentation. You can have multiple projects (e.g. personal blog, SaaS blog, documentation).
                        </ItemDescription>
                      </ItemContent>
                    </Item>

                    <Item size="sm" variant="muted">
                      <ItemContent>
                        <ItemTitle>Name and avatar</ItemTitle>
                        <ItemDescription>
                          Choose a clear name and an optional avatar to easily identify your project in the sidebar.
                        </ItemDescription>
                      </ItemContent>
                    </Item>

                    <Item size="sm" variant="muted">
                      <ItemContent>
                        <ItemTitle>Blog URL (later)</ItemTitle>
                        <ItemDescription>
                          The blog URL and article pattern are used only to generate automatic links in webhooks and analytics. This is not blocking: you can fill them in later in <span className="font-medium">Settings &gt; Project &gt; Article URL</span>.
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </ItemGroup>
                </div>

                <div className="px-2.5 py-2.5 flex flex-col gap-4">
                  <CreateProjectForm 
                    ref={formRef}
                    step={step}
                    onNext={handleNext}
                    onBack={handleBack}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between gap-2">
              <ThemeSwitcher variant="card" />

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleBack}
                  disabled={step === STEP_NAME || isSubmitting}
                >
                  Back
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={
                    step < STEP_PLAN
                      ? handleNext
                      : () => formRef.current?.submitForm()
                  }
                >
                  {step < STEP_PLAN
                    ? "Next"
                    : isSubmitting
                      ? "Creating..."
                      : "Create project"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}