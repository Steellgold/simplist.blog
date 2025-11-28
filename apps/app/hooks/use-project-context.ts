"use client"

import { useProjectContext } from "@/components/projects/context-provider"

export const useProject = () => {
  const {
    currentProject, projects,
    currentMember,
    currentMemberId
  } = useProjectContext()

  return {
    currentProject,
    projects,
    currentMember,
    currentMemberId
  }
}
