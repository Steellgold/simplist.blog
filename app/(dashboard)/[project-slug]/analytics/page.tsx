"use client"

import { AnalyticsActivation } from "@/components/analytics-activation"
import { useProject } from "@/hooks/use-project-context"

const AnalyticsPage = () => {
  const { currentProject } = useProject()

  if (!currentProject) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="max-w-2xl w-full p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">No Project Selected</h2>
            <p className="text-muted-foreground">
              Please select a project to view analytics.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <AnalyticsActivation projectId={currentProject.id} />
    </div>
  )
}

export default AnalyticsPage
