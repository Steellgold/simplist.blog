"use client"

import { PageLayout } from "@/components/layout/page-layout"
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
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog"
import { deleteProjectRole } from "@/lib/actions/roles"
import { Lock, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { CreateRoleDialog } from "@/components/roles/create-role-dialog"
import { EditRoleDialog } from "@/components/roles/edit-role-dialog"
import type { ProjectRole } from "@simplist/db"

type RolesClientPageProps = {
  project: {
    id: string
    name: string
    slug: string
    subscriptionTier: string
    subscriptionExpiresAt: Date | null
  }
  roles: ProjectRole[]
}

export const RolesClientPage = ({ project, roles: initialRoles }: RolesClientPageProps) => {
  const [roles, setRoles] = useState<ProjectRole[]>(initialRoles)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<ProjectRole | null>(null)
  const [deleteRoleDialog, setDeleteRoleDialog] = useState<{ id: string; name: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isPro = project.subscriptionTier === "PRO" &&
    project.subscriptionExpiresAt &&
    new Date(project.subscriptionExpiresAt) > new Date()

  const handleDeleteRole = async () => {
    if (!deleteRoleDialog) return

    setIsDeleting(true)

    toast.promise(
      deleteProjectRole(project.id, deleteRoleDialog.id),
      {
        loading: "Deleting role...",
        success: () => {
          setRoles(prev => prev.filter(r => r.id !== deleteRoleDialog.id))
          setDeleteRoleDialog(null)
          setIsDeleting(false)
          return `Role "${deleteRoleDialog.name}" deleted successfully`
        },
        error: (err) => {
          setIsDeleting(false)
          return err instanceof Error ? err.message : "Failed to delete role"
        }
      }
    )
  }

  const handleRoleCreated = (newRole: ProjectRole) => {
    setRoles(prev => [...prev, newRole])
  }

  const handleRoleUpdated = (updatedRole: ProjectRole) => {
    setRoles(prev => prev.map(r => r.id === updatedRole.id ? updatedRole : r))
  }

  const getPermissionsList = (role: ProjectRole): string[] => {
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
      description={`Manage roles and permissions for ${project.name}`}
      centered
      actions={
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          disabled={!isPro}
        >
          {!isPro
            ? <MiniBadge tier="PRO" size="sm" />
            : <Plus />
          }

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
          {roles.length === 0 ? (
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
                              <Lock />
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
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRole(role)}>
                              <Pencil />
                              Edit role
                            </DropdownMenuItem>

                            {!role.isDefault && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setDeleteRoleDialog({ id: role.id, name: role.name })}>
                                  <Trash2 />
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
          projectId={project.id}
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleRoleCreated}
        />
      )}

      {editingRole && (
        <EditRoleDialog
          projectId={project.id}
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={handleRoleUpdated}
        />
      )}

      <ConfirmDialog
        open={!!deleteRoleDialog}
        onOpenChange={(open) => !open && setDeleteRoleDialog(null)}
        onConfirm={handleDeleteRole}
        title="Delete role"
        description={`Are you sure you want to delete the "${deleteRoleDialog?.name}" role? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        disabled={isDeleting}
      />
    </PageLayout>
  )
}
