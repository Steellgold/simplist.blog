"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { Button } from "@simplist/ui/components/button"
import { MiniBadge } from "@/components/ui/mini-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Badge } from "@simplist/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@simplist/ui/components/dropdown-menu"
import { toast } from "@simplist/ui/components/sonner"
import { useProject } from "@/hooks/use-project-context"
import { getProjectRoles, deleteProjectRole } from "@/lib/actions/roles"
import { Lock, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { CreateRoleDialog } from "@/components/roles/create-role-dialog"
import { EditRoleDialog } from "@/components/roles/edit-role-dialog"

type Role = {
  id: string
  name: string
  slug: string
  isOwner: boolean
  isDefault: boolean
  canManageProject: boolean
  canManageMembers: boolean
  canManageRoles: boolean
  canManageArticles: boolean
  canManageApiKeys: boolean
  canViewAnalytics: boolean
  canManageBilling: boolean
  canDeleteProject: boolean
}

const RolesPage = () => {
  const { currentProject } = useProject()
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  useEffect(() => {
    if (!currentProject) return

    const loadRoles = async () => {
      try {
        setIsLoading(true)
        const rolesData = await getProjectRoles(currentProject.id)
        setRoles(rolesData as Role[])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load roles")
      } finally {
        setIsLoading(false)
      }
    }

    loadRoles()
  }, [currentProject])

  if (!currentProject) return <EmptyProject />

  const isPro = currentProject.subscriptionTier === "PRO" &&
    currentProject.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date()

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!confirm(`Are you sure you want to delete the "${roleName}" role?`)) return

    toast.promise(
      deleteProjectRole(currentProject.id, roleId),
      {
        loading: "Deleting role...",
        success: () => {
          setRoles(prev => prev.filter(r => r.id !== roleId))
          return `Role "${roleName}" deleted successfully`
        },
        error: (err) => err instanceof Error ? err.message : "Failed to delete role"
      }
    )
  }

  const handleRoleCreated = (newRole: Role) => {
    setRoles(prev => [...prev, newRole])
  }

  const handleRoleUpdated = (updatedRole: Role) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r))
  }

  const getPermissionsList = (role: Role): string[] => {
    const permissions: string[] = []
    if (role.canManageProject) permissions.push("Manage project")
    if (role.canManageMembers) permissions.push("Manage members")
    if (role.canManageRoles) permissions.push("Manage roles")
    if (role.canManageArticles) permissions.push("Manage articles")
    if (role.canManageApiKeys) permissions.push("Manage API keys")
    if (role.canViewAnalytics) permissions.push("View analytics")
    if (role.canManageBilling) permissions.push("Manage billing")
    if (role.canDeleteProject) permissions.push("Delete project")
    return permissions
  }

  return (
    <PageLayout
      title="Roles & Permissions"
      description={`Manage roles and permissions for ${currentProject.name}`}
      centered
      actions={
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          disabled={!isPro}
        >
          {!isPro && <MiniBadge tier="PRO" size="sm" />}
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Project Roles</CardTitle>
          <CardDescription>
            Define custom roles with specific permissions for your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No roles found</div>
          ) : (
            <div className="divide-y">
              {roles.map((role) => {
                const permissions = getPermissionsList(role)

                return (
                  <div key={role.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{role.name}</h3>
                          {role.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          {role.isOwner && (
                            <Badge variant="default">
                              <Lock className="mr-1 h-3 w-3" />
                              Owner
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {permissions.length > 0 ? (
                            <>
                              {permissions.slice(0, 3).join(", ")}
                              {permissions.length > 3 && ` +${permissions.length - 3} more`}
                            </>
                          ) : (
                            "No permissions"
                          )}
                        </p>
                      </div>

                      {!role.isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRole(role)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit role
                            </DropdownMenuItem>

                            {!role.isDefault && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteRole(role.id, role.name)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete role
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {permissions.length > 3 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateDialog && (
        <CreateRoleDialog
          projectId={currentProject.id}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleRoleCreated}
        />
      )}

      {editingRole && (
        <EditRoleDialog
          projectId={currentProject.id}
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={handleRoleUpdated}
        />
      )}
    </PageLayout>
  )
}

export default RolesPage
