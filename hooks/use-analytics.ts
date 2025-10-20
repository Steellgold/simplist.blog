"use client"

import { useQuery } from "@tanstack/react-query"
import {
  getAllProjectAnalytics,
  getProjectAnalytics,
  type AnalyticsData,
  type AnalyticsDataMultiPeriod,
} from "@/lib/actions/analytics"
import { getUserProjects } from "@/lib/actions/projects"

export const analyticsKeys = {
  all: ["analytics"] as const,
  project: (projectId: string) => [...analyticsKeys.all, "project", projectId] as const,
  projectPeriod: (projectId: string, days: number, articleIds?: string[]) =>
    [...analyticsKeys.project(projectId), days, articleIds || "all"] as const,
  projectAllPeriods: (projectId: string, articleIds?: string[]) =>
    [...analyticsKeys.project(projectId), "all-periods", articleIds || "all"] as const,
}

export const useProjectAnalytics = (days: number = 30, articleIds?: string[]) => {
  return useQuery({
    queryKey: analyticsKeys.projectPeriod("current", days, articleIds),
    queryFn: async (): Promise<AnalyticsData | null> => {
      const projects = await getUserProjects()
      const project = projects[0]

      if (!project) {
        return null
      }

      return await getProjectAnalytics(project.id, days, articleIds)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - analytics don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  })
}

export const useAllProjectAnalytics = (articleIds?: string[]) => {
  return useQuery({
    queryKey: analyticsKeys.projectAllPeriods("current", articleIds),
    queryFn: async (): Promise<AnalyticsDataMultiPeriod | null> => {
      const projects = await getUserProjects()
      const project = projects[0]

      if (!project) {
        return null
      }

      return await getAllProjectAnalytics(project.id, articleIds)
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  })
}
