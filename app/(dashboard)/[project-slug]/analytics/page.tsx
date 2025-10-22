import { AnalyticsActivation } from "@/components/analytics-activation"
import { getCurrentUser } from "@/lib/auth-helper"
import { prisma } from "@/lib/db"
import { checkAnalyticsAccess } from "@/lib/subscription/quota-check"
import { redirect } from "next/navigation"

interface AnalyticsPageProps {
  params: Promise<{
    "project-slug": string
  }>
}

const AnalyticsPage = async ({ params }: AnalyticsPageProps) => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user has access to analytics
  const hasAccess = await checkAnalyticsAccess(user.id)

  if (!hasAccess) {
    redirect("/pricing")
  }

  const resolvedParams = await params
  const projectSlug = resolvedParams["project-slug"]

  // Get project from slug
  const project = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      userId: user.id,
    },
  })

  if (!project) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <AnalyticsActivation projectId={project.id} />
    </div>
  )
}

export default AnalyticsPage
