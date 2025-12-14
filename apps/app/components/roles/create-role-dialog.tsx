"use client"

import { createProjectRole } from "@/lib/actions/roles"
import { Button } from "@simplist/ui/components/button"
import { Checkbox } from "@simplist/ui/components/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@simplist/ui/components/dialog"
import { Input } from "@simplist/ui/components/input"
import { Label } from "@simplist/ui/components/label"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { useState } from "react"

type CreateRoleDialogProps = {
  projectId: string
  onClose: () => void
  onSuccess: (role: any) => void
}

type Permissions = {
  canManageProject: boolean
  canManageMembers: boolean
  canManageRoles: boolean
  canManageArticles: boolean
  canManageApiKeys: boolean
  canManageWebhooks: boolean
  canViewAnalytics: boolean
}

export const CreateRoleDialog = ({ projectId, onClose, onSuccess }: CreateRoleDialogProps) => {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [permissions, setPermissions] = useState<Permissions>({
    canManageProject: false,
    canManageMembers: false,
    canManageRoles: false,
    canManageArticles: false,
    canManageApiKeys: false,
    canManageWebhooks: false,
    canViewAnalytics: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (value: string) => {
    setName(value)
    // Auto-generate slug from name
    const generatedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
    setSlug(generatedSlug)
  }

  const handlePermissionChange = (key: keyof Permissions, value: boolean) => {
    setPermissions(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      toast.error("Please enter a role name")
      return
    }

    setIsSubmitting(true)

    try {
      const role = await createProjectRole(projectId, {
        name,
        slug,
        permissions
      })
      toast.success(`Role "${name}" created successfully`)
      onSuccess(role)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create role")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Custom Role</DialogTitle>
            <DialogDescription>
              Create a new role with specific permissions for your team members.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role name</Label>
              <Input
                id="name"
                placeholder="e.g., Content Manager"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canManageProject"
                    checked={permissions.canManageProject}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canManageProject", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canManageProject"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage project settings
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can modify project name, description, and settings
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canManageMembers"
                    checked={permissions.canManageMembers}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canManageMembers", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canManageMembers"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage members
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can invite and remove team members
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canManageRoles"
                    checked={permissions.canManageRoles}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canManageRoles", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canManageRoles"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage roles
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can create, edit, and delete custom roles
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canManageArticles"
                    checked={permissions.canManageArticles}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canManageArticles", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canManageArticles"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage articles
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can create, edit, and delete articles
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canManageApiKeys"
                    checked={permissions.canManageApiKeys}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canManageApiKeys", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canManageApiKeys"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage API keys
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can create and delete API keys
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canManageWebhooks"
                    checked={permissions.canManageWebhooks}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canManageWebhooks", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canManageWebhooks"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Manage webhooks
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can create, edit, and delete outgoing webhooks
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="canViewAnalytics"
                    checked={permissions.canViewAnalytics}
                    onCheckedChange={(checked) =>
                      handlePermissionChange("canViewAnalytics", checked as boolean)
                    }
                    disabled={isSubmitting}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="canViewAnalytics"
                      className="text-sm font-medium cursor-pointer"
                    >
                      View analytics
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Can view project analytics and statistics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create Role"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
