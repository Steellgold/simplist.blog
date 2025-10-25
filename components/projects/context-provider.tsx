"use client"

import { Timezone } from "@/components/ui/timezone-selector"
import { SubscriptionTier } from "@prisma/client"
import { createContext, ReactNode, useContext } from "react"

interface Project {
  id: string
  name: string
  slug: string
  timezone: Timezone
  allowedOrigins?: string[]
  subscriptionTier?: SubscriptionTier
  subscriptionExpiresAt?: Date | null
  stripeCustomerId?: string | null
}

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

interface ProjectContextProviderProps {
  children: ReactNode
  projects: Project[]
  currentProject: Project | null
}

export const ProjectContextProvider = ({ children, projects, currentProject }: ProjectContextProviderProps) => {
  return (
    <ProjectContext.Provider value={{ currentProject, projects }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjectContext = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectContextProvider")
  }
  return context
}
