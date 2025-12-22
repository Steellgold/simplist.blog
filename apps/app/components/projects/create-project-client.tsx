"use client";

import { CreateProjectForm } from "@/components/projects/create-form";
import { createProject } from "@/lib/actions/projects";
import { createCheckoutSession } from "@/lib/stripe/actions";
import { generateSlug } from "@/lib/utils";
import {
  CreateProjectInput,
  isReservedSlug,
  ProjectStep,
  STEP_NAME,
  STEP_PLAN,
} from "@/lib/validations/project";
import { PlanIds, SubscriptionInterval } from "@simplist/limits";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { ButtonGroup } from "@simplist/ui/components/button-group";
import { Card, CardContent, CardFooter } from "@simplist/ui/components/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@simplist/ui/components/item";
import { ThemeSwitcher } from "@simplist/ui/components/shared/switch-theme";
import { toast } from "@simplist/ui/components/sonner";
import { useIsMobile } from "@simplist/ui/hooks/use-mobile";
import { ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export const CreateProjectPageClient = () => {
  const router = useRouter();
  const [step, setStep] = useState<ProjectStep>(STEP_NAME);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasFormData, setHasFormData] = useState(false);
  const isMobile = useIsMobile();

  const formRef = useRef<{
    validateStep: (step: number) => Promise<boolean>;
    submitForm: () => void;
    resetForm: () => void;
    hasData: boolean;
  }>(null);

  const handleNext = async () => {
    if (formRef.current) {
      const isValid = await formRef.current.validateStep(step);
      if (!isValid) return;
    }
    setStep((prev) => (prev < STEP_PLAN ? ((prev + 1) as ProjectStep) : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > STEP_NAME ? ((prev - 1) as ProjectStep) : prev));
  };

  const handleSubmit = async (
    data: CreateProjectInput & {
      selectedPlan: PlanIds;
      billingInterval: SubscriptionInterval;
    },
  ) => {
    setError("");
    setIsSubmitting(true);
    const slug = generateSlug(data.name);

    if (isReservedSlug(slug)) {
      setError(
        `The name "${data.name}" generates a reserved slug. Please choose a different name.`,
      );
      setIsSubmitting(false);
      return;
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
      }),
      {
        loading: "Creating project...",
        success: async (project) => {
          setIsSubmitting(false);

          if (data.selectedPlan === "PRO") {
            try {
              const { url } = await createCheckoutSession(
                data.billingInterval,
                project.id,
              );
              window.location.href = url;
            } catch (error) {
              console.error("Failed to create checkout session:", error);
              router.push(`/${project.slug}/settings/billing`);
            }
          } else {
            router.push(`/${project.slug}`);
            router.refresh();
          }

          return "Project created";
        },
        error: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : "Failed to create project";
          setError(message);
          setIsSubmitting(false);
          return message;
        },
      },
    );
  };

  const handleReset = () => {
    formRef.current?.resetForm();
    setHasFormData(false);
    setStep(STEP_NAME);
  };

  const handleFormChange = (hasData: boolean) => setHasFormData(hasData);

  const handleStepChange = async (newStep: ProjectStep) => {
    // If going backwards, allow it without validation
    if (newStep < step) {
      setStep(newStep);
      return;
    }

    // If going forward, validate each step in between
    for (let i = step; i < newStep; i++) {
      if (formRef.current) {
        const isValid = await formRef.current.validateStep(i);
        if (!isValid) return;
      }
    }

    setStep(newStep);
  };

  return (
    <div className="flex-1">
      <div className="bg-background/0 fixed inset-0 z-40 backdrop-blur-sm" />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <Card>
            <CardContent>
              <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  <Badge
                    variant="secondary"
                    className="text-xs tracking-wide uppercase"
                  >
                    Onboarding
                  </Badge>

                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Create your first project
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-md text-sm">
                      Set up your project with a name and icon. You can
                      configure advanced settings anytime later.
                    </p>
                  </div>

                  <ItemGroup>
                    <Item size="sm" variant="muted">
                      <ItemContent>
                        <ItemTitle>What's a project?</ItemTitle>
                        <ItemDescription>
                          Each project represents a blog or documentation site.
                          Create separate projects for different websites.
                        </ItemDescription>
                      </ItemContent>
                    </Item>

                    <Item size="sm" variant="muted">
                      <ItemContent>
                        <ItemTitle>Identify your project</ItemTitle>
                        <ItemDescription>
                          Pick a name and icon to quickly spot this project in
                          your sidebar.
                        </ItemDescription>
                      </ItemContent>
                    </Item>

                    <Item size="sm" variant="muted">
                      <ItemContent>
                        <ItemTitle>URLs (optional)</ItemTitle>
                        <ItemDescription>
                          Add your blog URL to enable automatic links in
                          webhooks and analytics. Skip this step and configure
                          it anytime in project settings.
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </ItemGroup>
                </div>

                <div className="flex flex-col gap-4 px-2.5 py-2.5">
                  <CreateProjectForm
                    ref={formRef}
                    step={step}
                    onNext={handleNext}
                    onBack={handleBack}
                    onStepChange={handleStepChange}
                    onSubmit={handleSubmit}
                    onFormChange={handleFormChange}
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
                  onClick={handleReset}
                  disabled={isSubmitting || !hasFormData}
                >
                  <RefreshCcw />
                </Button>

                <ButtonGroup>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === STEP_NAME || isSubmitting}
                  >
                    {isMobile ? <ArrowLeft /> : "Back"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isSubmitting}
                    onClick={
                      step < STEP_PLAN
                        ? handleNext
                        : () => formRef.current?.submitForm()
                    }
                  >
                    {step < STEP_PLAN ? (
                      isMobile ? (
                        <ArrowRight />
                      ) : (
                        "Next"
                      )
                    ) : isSubmitting ? (
                      "Creating..."
                    ) : (
                      "Create project"
                    )}
                  </Button>
                </ButtonGroup>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
