"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { AppSidebar } from "./app-sidebar"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
}

interface Project {
  id: string
  name: string
  slug: string
}

interface AppSidebarWrapperProps {
  user: User
  project: Project | null
}

export const AppSidebarWrapper = ({ user, project }: AppSidebarWrapperProps) => {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/login")
        },
      },
    })
  }

  return (
    <AppSidebar
      user={user}
      project={project}
      onLogout={handleLogout}
    />
  )
}
