"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"

interface Project {
  id: string
  name: string
  slug: string
}

interface UseActiveProjectProps {
  projects: Project[]
  currentProject?: Project | null
}

export const useActiveProject = ({ projects, currentProject }: UseActiveProjectProps) => {
  const router = useRouter()
  const params = useParams()
  const projectSlug = params["pslug"] as string

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
    // Navigate to the project's dashboard
    router.push(`/${project.slug}`)
  }, [router])

  const createProjectUrl = useCallback(() => {
    return "/create-project"
  }, [])

  return {
    activeProject,
    setActiveProject,
    createProjectUrl,
  }
}
