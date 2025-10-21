"use client"

import { useProjectContext } from "@/components/project-context-provider"

export const useProject = () => {
  const { currentProject, projects } = useProjectContext()

  return {
    currentProject,
    projects
  }
}
