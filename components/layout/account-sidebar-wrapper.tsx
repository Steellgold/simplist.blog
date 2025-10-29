"use client"

import { AccountSidebar } from "./account-sidebar"
import type { User } from "@/lib/auth-client"

interface AccountSidebarWrapperProps {
  user: User
}

export const AccountSidebarWrapper = ({ user }: AccountSidebarWrapperProps) => {
  return (
    <AccountSidebar user={user} />
  )
}
