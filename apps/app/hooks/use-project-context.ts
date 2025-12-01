"use client"

import { useProjectContext } from "@/components/projects/context-provider"

export const useProject = () => {
  const {
    currentProject,
    projects,
    currentMember,
    currentMemberId,
    refreshProjects,
    isRefreshing
  } = useProjectContext()

  return {
    currentProject,
    projects,
    currentMember,
    currentMemberId,
    refreshProjects,
    isRefreshing
  }
}
