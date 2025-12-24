"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { CreateRoleDialog } from "@/components/roles/create-role-dialog";
import { EditRoleDialog } from "@/components/roles/edit-role-dialog";
import { MiniBadge } from "@/components/ui/mini-badge";
import { deleteProjectRole } from "@/lib/actions/roles";
import {
  CreditCard,
  EllipsisVertical,
  FileText, Gear, Key,
  Lock,
  Magnifier, Pencil,
  Persons,
  Plus,
  Shield,
  TrashBin
} from "@gravity-ui/icons";
import type { ProjectRole } from "@simplist/db";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent, CardHeader } from "@simplist/ui/components/card";
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@simplist/ui/components/dropdown-menu";
import { Empty, EmptyHeader, EmptyMedia } from "@simplist/ui/components/empty";
import { Webhook } from "@simplist/ui/components/icons";
import { toast } from "@simplist/ui/components/sonner";
import { useState } from "react";
import { BarChart } from "recharts";

type RolesClientPageProps = {
  project: {
    id: string;
    name: string;
    slug: string;
    subscriptionTier: string;
    subscriptionExpiresAt: Date | null;
  };
  roles: (ProjectRole & {
    _count: {
      members: number;
    };
  })[];
};

export const RolesClientPage = ({
  project,
  roles: initialRoles,
}: RolesClientPageProps) => {
  const [roles, setRoles] =
    useState<(ProjectRole & { _count: { members: number } })[]>(initialRoles);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<ProjectRole | null>(null);
  const [deleteRoleDialog, setDeleteRoleDialog] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isPro =
    project.subscriptionTier === "PRO" &&
    project.subscriptionExpiresAt &&
    new Date(project.subscriptionExpiresAt) > new Date();

  const handleDeleteRole = async () => {
    if (!deleteRoleDialog) return;

    setIsDeleting(true);

    toast.promise(deleteProjectRole(project.id, deleteRoleDialog.id), {
      loading: "Deleting role...",
      success: () => {
        setRoles((prev) => prev.filter((r) => r.id !== deleteRoleDialog.id));
        setDeleteRoleDialog(null);
        setIsDeleting(false);
        return `Role "${deleteRoleDialog.name}" deleted successfully`;
      },
      error: (err) => {
        setIsDeleting(false);
        return err instanceof Error ? err.message : "Failed to delete role";
      },
    });
  };

  const handleRoleCreated = (newRole: ProjectRole) => {
    setRoles((prev) => [...prev, { ...newRole, _count: { members: 0 } }]);
  };

  const handleRoleUpdated = (updatedRole: ProjectRole) => {
    setRoles((prev) =>
      prev.map((r) => (r.id === updatedRole.id ? { ...r, ...updatedRole } : r)),
    );
  };

  const getPermissionsList = (role: ProjectRole): string[] => {
    const permissions: string[] = [];
    if (role.canManageProject) permissions.push("Manage project");
    if (role.canManageMembers) permissions.push("Manage members");
    if (role.canManageRoles) permissions.push("Manage roles");
    if (role.canManageArticles) permissions.push("Manage articles");
    if (role.canManageApiKeys) permissions.push("Manage API keys");
    if (role.canManageWebhooks) permissions.push("Manage webhooks");
    if (role.canViewAnalytics) permissions.push("View analytics");
    if (role.canManageBilling) permissions.push("Manage billing");
    if (role.canDeleteProject) permissions.push("Delete project");
    return permissions;
  };

  return (
    <PageLayout
      title="Roles"
      description="Manage custom roles and permissions for your team."
      centered
      actions={
        <Button onClick={() => setShowCreateDialog(true)} disabled={!isPro}>
          {!isPro ? <MiniBadge tier="PRO" size="sm" /> : <Plus />}
          Create Role
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Section: List of roles */}
        <Card className="p-0">
          <CardContent className="p-0">
            {roles.length === 0 ? (
              <Empty className="flex h-full min-h-[calc(90vh-4rem)] items-center justify-center">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Magnifier />
                  </EmptyMedia>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="divide-y">
                {roles.map((role) => {
                  const permissions = getPermissionsList(role);

                  return (
                    <div
                      key={role.id}
                      className="hover:bg-muted/50 p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Left: Name + Badges */}
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="min-w-0">
                            <div className="mb-1 flex items-center gap-2">
                              <h3 className="truncate font-medium">
                                {role.name}
                              </h3>
                              {role.isDefault && (
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-xs"
                                >
                                  Default
                                </Badge>
                              )}
                              {role.isOwner && (
                                <Badge
                                  variant="default"
                                  className="shrink-0 text-xs"
                                >
                                  <Lock className="h-3 w-3" />
                                  Owner
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {permissions.length}{" "}
                              {permissions.length === 1
                                ? "permission"
                                : "permissions"}{" "}
                              • {role._count.members}{" "}
                              {role._count.members === 1 ? "member" : "members"}
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        {!role.isOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0"
                              >
                                <EllipsisVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setTimeout(() => setEditingRole(role), 0);
                                }}
                              >
                                <Pencil />
                                Edit role
                              </DropdownMenuItem>
                              {!role.isDefault && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onSelect={(e) => {
                                      e.preventDefault();
                                      setTimeout(
                                        () =>
                                          setDeleteRoleDialog({
                                            id: role.id,
                                            name: role.name,
                                          }),
                                        0,
                                      );
                                    }}
                                  >
                                    <TrashBin />
                                    Delete role
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section: Permission Reference */}
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Permission Reference</h2>
              <p className="text-muted-foreground text-sm">
                Complete list of available permissions and their descriptions
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Category: Project Management */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Project Management</h3>
                  <Badge variant="outline" className="rounded-full text-xs">
                    3 permissions
                  </Badge>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <Gear className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage project settings
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <TrashBin className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Delete project
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <CreditCard className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage billing
                    </span>
                  </div>
                </div>
              </div>

              {/* Category: Team Management */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Team Management</h3>
                  <Badge variant="outline" className="rounded-full text-xs">
                    2 permissions
                  </Badge>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <Persons className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage members
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <Shield className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage roles
                    </span>
                  </div>
                </div>
              </div>

              {/* Category: Content & API */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium">Content & API</h3>
                  <Badge variant="outline" className="rounded-full text-xs">
                    4 permissions
                  </Badge>
                </div>
                <div className="space-y-2 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <FileText className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage articles
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <Key className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage API keys
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <Webhook className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      Manage webhooks
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-muted flex size-6 items-center justify-center rounded-full">
                      <BarChart className="h-3 w-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      View analytics
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
  );
};
