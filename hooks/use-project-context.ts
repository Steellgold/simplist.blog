"use client"

import { useProjectContext } from "@/components/projects/context-provider"

export const useProject = () => {
  const { currentProject, projects } = useProjectContext()

  return {
    currentProject,
    projects
  }
}
