"use client"

import { Project } from "@simplist/db"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"

interface UseActiveProjectProps {
  projects: Project[]
  currentProject?: Project | null
}

export const useActiveProject = ({ projects, currentProject }: UseActiveProjectProps) => {
  const router = useRouter()
  const params = useParams()
  const projectSlug = params["project-slug"] as string

  const activeProject = useMemo(() => {
    if (currentProject) {
      return currentProject
    }
    if (projectSlug) {
      return projects.find(p => p.slug === projectSlug) || projects[0] || null
    }
    return projects[0] || null
  }, [projects, projectSlug, currentProject])

  const setActiveProject = useCallback((project: Project) => {
    // Get current pathname to preserve the route structure
    const currentPath = window.location.pathname
    const currentSlug = projectSlug
    
    // Replace the current project slug with the new one
    const newPath = currentPath.replace(`/${currentSlug}`, `/${project.slug}`)
    
    // If we're on a specific article or sub-page, redirect to project root
    // Otherwise, just replace the slug
    if (newPath.includes('/articles/') || newPath.includes('/analytics/')) {
      router.push(`/${project.slug}`)
    } else {
      router.push(newPath)
    }
  }, [router, projectSlug])

  const createProjectUrl = useCallback(() => {
    return "/create-project"
  }, [])

  return {
    activeProject,
    setActiveProject,
    createProjectUrl,
  }
}
