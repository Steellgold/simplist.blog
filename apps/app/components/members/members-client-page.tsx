"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { InviteMemberDialog } from "@/components/members/invite-member-dialog"
import { removeProjectMember, revokeProjectInvitation, updateMemberRole } from "@/lib/actions/members"
import { getPlanLimits } from "@/lib/subscription/plans"
import type { MemberListItem } from "@/lib/types/members"
import type { ProjectInvitation, ProjectRole } from "@simplist/db"
import { Avatar, AvatarFallback, AvatarImage } from "@simplist/ui/components/avatar"
import { Badge } from "@simplist/ui/components/badge"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { ConfirmDialog } from "@simplist/ui/components/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@simplist/ui/components/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@simplist/ui/components/empty"
import { toast } from "@simplist/ui/components/sonner"
import { getInitials } from "@simplist/ui/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { MoreVertical, UserMinus, UserPlus, Users, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

type MembersClientPageProps = {
  project: {
    id: string
    name: string
    slug: string
    subscriptionTier: string
    subscriptionExpiresAt: Date | null
  }
  currentMember: {
    id: string
    roleId: string
    isOwner: boolean
  }
  members: MemberListItem[]
  invitations: ProjectInvitation[]
  roles: ProjectRole[]
}

export const MembersClientPage = ({
  project,
  currentMember,
  members: initialMembers,
  invitations: initialInvitations,
  roles
}: MembersClientPageProps) => {
  const router = useRouter()
  const [members, setMembers] = useState<MemberListItem[]>(initialMembers)
  const [invitations, setInvitations] = useState<ProjectInvitation[]>(initialInvitations)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [removeMemberDialog, setRemoveMemberDialog] = useState<{ id: string; name: string | null } | null>(null)
  const [revokeInviteDialog, setRevokeInviteDialog] = useState<{ id: string; email: string } | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const isPro = project.subscriptionTier === "PRO" &&
    project.subscriptionExpiresAt &&
    new Date(project.subscriptionExpiresAt) > new Date()

  const tier = isPro ? "PRO" : "STARTER"
  const limits = getPlanLimits(tier)
  const currentMemberCount = members.length
  const canInviteMore = limits.maxMembers === -1 || currentMemberCount < limits.maxMembers

  const handleRemoveMember = async () => {
    if (!removeMemberDialog) return

    setIsRemoving(true)

    toast.promise(
      removeProjectMember(project.id, removeMemberDialog.id),
      {
        loading: "Removing member...",
        success: () => {
          setMembers(prev => prev.filter(m => m.id !== removeMemberDialog.id))
          setRemoveMemberDialog(null)
          setIsRemoving(false)
          return `${removeMemberDialog.name || "Member"} removed successfully`
        },
        error: (err) => {
          setIsRemoving(false)
          return err instanceof Error ? err.message : "Failed to remove member"
        }
      }
    )
  }

  const handleChangeRole = async (memberId: string, newRoleId: string, memberName: string | null) => {
    const newRole = roles.find(r => r.id === newRoleId)

    toast.promise(
      updateMemberRole(project.id, memberId, newRoleId),
      {
        loading: "Updating role...",
        success: () => {
          setMembers(prev => prev.map(m =>
            m.id === memberId
              ? { ...m, role: newRole! }
              : m
          ))
          router.refresh()
          return `${memberName || "Member"} role updated to ${newRole?.name}`
        },
        error: (err) => err instanceof Error ? err.message : "Failed to update role"
      }
    )
  }

  const handleRevokeInvitation = async () => {
    if (!revokeInviteDialog) return

    setIsRemoving(true)

    toast.promise(
      revokeProjectInvitation(project.id, revokeInviteDialog.id),
      {
        loading: "Revoking invitation...",
        success: () => {
          setInvitations(prev => prev.filter(i => i.id !== revokeInviteDialog.id))
          setRevokeInviteDialog(null)
          setIsRemoving(false)
          return `Invitation for ${revokeInviteDialog.email} revoked`
        },
        error: (err) => {
          setIsRemoving(false)
          return err instanceof Error ? err.message : "Failed to revoke invitation"
        }
      }
    )
  }

  if (members.length === 1) {
    return (
      <div className="flex min-h-[calc(90vh-4rem)] items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No members yet</EmptyTitle>
            <EmptyDescription>Invite teammates to collaborate on this project.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setShowInviteDialog(true)} disabled={!canInviteMore}>
              <UserPlus />
              Invite Member
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <PageLayout
      title="Members"
      description={`Manage team members for ${project.name}`}
      centered
      actions={
        <Button
          onClick={() => setShowInviteDialog(true)}
          disabled={!canInviteMore}
        >
          <UserPlus />
          Invite Member
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Active Members */}
        <Card>
          <CardHeader>
            <CardTitle>
              {members.length > 1 ? `Team Members (${members.length})` : "Team members"}
            </CardTitle>

            <CardDescription>
              People who have access to this project
            </CardDescription>
          </CardHeader>

          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No members yet</div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="rounded-sm">
                        <AvatarImage src={member.image || undefined} alt={member.name || undefined} />
                        <AvatarFallback className="rounded-sm">{getInitials(member.name)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name || "Unknown"}</p>
                        </div>

                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={member.role.isOwner ? "default" : "secondary"}>{member.role.name}</Badge>

                      {!member.role.isOwner && member.id !== currentMember?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <div className="px-2 py-1.5 text-sm font-semibold">Change Role</div>
                            {roles.filter(r => !r.isOwner).map((role) => (
                              <DropdownMenuItem
                                key={role.id}
                                onClick={() => handleChangeRole(member.id, role.id, member.name)}
                                disabled={role.id === member.role.id}
                              >
                                {role.name}
                                {role.id === member.role.id && " (current)"}
                              </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => setRemoveMemberDialog({ id: member.id, name: member.name })}
                            >
                              <UserMinus />
                              Remove from project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
              <CardDescription>
                Invitations that haven't been accepted yet
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="divide-y">
                {invitations.map((invitation) => {
                  const role = roles.find(r => r.id === invitation.roleId)
                  const expiresIn = formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true })

                  return (
                    <div key={invitation.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="rounded-sm">
                          <AvatarImage src={`https://avatar.vercel.sh/${invitation.email.toLowerCase().replaceAll(" ", "")}`} alt={invitation.email} />
                          <AvatarFallback className="rounded-sm">{getInitials(invitation.email)}</AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Invited {formatDistanceToNow(new Date(invitation.invitedAt), { addSuffix: true })} · Expires {expiresIn}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{role?.name || "Unknown Role"}</Badge>

                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() => setRevokeInviteDialog({ id: invitation.id, email: invitation.email })}
                        >
                          <UserX />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showInviteDialog && (
        <InviteMemberDialog
          projectId={project.id}
          roles={roles.filter(r => !r.isOwner)}
          onClose={() => setShowInviteDialog(false)}
        />
      )}

      <ConfirmDialog
        open={!!removeMemberDialog}
        onOpenChange={(open) => !open && setRemoveMemberDialog(null)}
        onConfirm={handleRemoveMember}
        title="Remove member"
        description={`Are you sure you want to remove ${removeMemberDialog?.name || "this member"} from the project? They will lose access immediately.`}
        confirmText="Remove"
        variant="destructive"
        disabled={isRemoving}
      />

      <ConfirmDialog
        open={!!revokeInviteDialog}
        onOpenChange={(open) => !open && setRevokeInviteDialog(null)}
        onConfirm={handleRevokeInvitation}
        title="Revoke invitation"
        description={`Are you sure you want to revoke the invitation for ${revokeInviteDialog?.email}?`}
        confirmText="Revoke"
        variant="destructive"
        disabled={isRemoving}
      />
    </PageLayout>
  )
}
