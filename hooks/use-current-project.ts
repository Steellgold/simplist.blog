"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"

interface Project {
  id: string
  name: string
  slug: string
}

interface UseCurrentProjectProps {
  projects: Project[]
  currentProject?: Project | null
}

export const useCurrentProject = ({ projects, currentProject }: UseCurrentProjectProps) => {
  const params = useParams()
  const projectSlug = params["pslug"] as string

  const project = useMemo(() => {
    if (currentProject) {
      return currentProject
    }
    if (projectSlug) {
      return projects.find(p => p.slug === projectSlug) || projects[0] || null
    }
    return projects[0] || null
  }, [projects, projectSlug, currentProject])

  return project
}
