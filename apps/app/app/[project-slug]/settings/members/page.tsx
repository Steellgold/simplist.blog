"use client"

import { PageLayout } from "@/components/layout/page-layout"
import { EmptyProject } from "@/components/projects/empty-project"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Badge } from "@simplist/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@simplist/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@simplist/ui/components/dropdown-menu"
import { toast } from "@simplist/ui/components/sonner"
import { useProject } from "@/hooks/use-project-context"
import { getProjectMembers, getProjectInvitations, removeProjectMember, updateMemberRole, revokeProjectInvitation } from "@/lib/actions/members"
import { getProjectRoles } from "@/lib/actions/roles"
import { Crown, MoreVertical, UserMinus, UserX, Mail, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { InviteMemberDialog } from "@/components/members/invite-member-dialog"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

type Member = {
  id: string
  userId: string
  name: string | null
  email: string | null
  image: string | null
  role: {
    id: string
    name: string
    slug: string
    isOwner: boolean
    isDefault: boolean
  }
  joinedAt: Date | null
}

type Invitation = {
  id: string
  email: string
  roleId: string
  status: string
  invitedAt: Date
  expiresAt: Date
}

type Role = {
  id: string
  name: string
  slug: string
  isOwner: boolean
  isDefault: boolean
}

const MembersPage = () => {
  const { currentProject } = useProject()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  useEffect(() => {
    if (!currentProject) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        const [membersData, invitationsData, rolesData] = await Promise.all([
          getProjectMembers(currentProject.id),
          getProjectInvitations(currentProject.id),
          getProjectRoles(currentProject.id)
        ])
        setMembers(membersData)
        setInvitations(invitationsData)
        setRoles(rolesData)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load members")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentProject])

  if (!currentProject) return <EmptyProject />

  const isPro = currentProject.subscriptionTier === "PRO" &&
    currentProject.subscriptionExpiresAt &&
    new Date(currentProject.subscriptionExpiresAt) > new Date()

  const handleRemoveMember = async (memberId: string, memberName: string | null) => {
    if (!confirm(`Are you sure you want to remove ${memberName || "this member"}?`)) return

    toast.promise(
      removeProjectMember(currentProject.id, memberId),
      {
        loading: "Removing member...",
        success: () => {
          setMembers(prev => prev.filter(m => m.id !== memberId))
          return `${memberName || "Member"} removed successfully`
        },
        error: (err) => err instanceof Error ? err.message : "Failed to remove member"
      }
    )
  }

  const handleChangeRole = async (memberId: string, newRoleId: string, memberName: string | null) => {
    const newRole = roles.find(r => r.id === newRoleId)

    toast.promise(
      updateMemberRole(currentProject.id, memberId, newRoleId),
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

  const handleRevokeInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Revoke invitation for ${email}?`)) return

    toast.promise(
      revokeProjectInvitation(currentProject.id, invitationId),
      {
        loading: "Revoking invitation...",
        success: () => {
          setInvitations(prev => prev.filter(i => i.id !== invitationId))
          return `Invitation for ${email} revoked`
        },
        error: (err) => err instanceof Error ? err.message : "Failed to revoke invitation"
      }
    )
  }

  const handleInviteSuccess = (newInvitation: Invitation) => {
    setInvitations(prev => [newInvitation, ...prev])
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <PageLayout
      title="Members"
      description={`Manage team members for ${currentProject.name}`}
      centered
      actions={
        <Button
          size="sm"
          onClick={() => setShowInviteDialog(true)}
          disabled={!isPro}
        >
          <UserPlus className="size-4" />
          Invite Member
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Active Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({members.length})</CardTitle>
            <CardDescription>
              People who have access to this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No members yet</div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.image || undefined} alt={member.name || undefined} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.name || "Unknown"}</p>
                          {member.role.isOwner && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{member.role.name}</Badge>

                      {!member.role.isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
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
                              onClick={() => handleRemoveMember(member.id, member.name)}
                              className="text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
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

        {/* Pending Invitations */}
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
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
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
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeInvitation(invitation.id, invitation.email)}
                        >
                          <UserX className="h-4 w-4" />
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
          projectId={currentProject.id}
          roles={roles.filter(r => !r.isOwner)}
          onClose={() => setShowInviteDialog(false)}
          onSuccess={handleInviteSuccess}
        />
      )}
    </PageLayout>
  )
}

export default MembersPage
