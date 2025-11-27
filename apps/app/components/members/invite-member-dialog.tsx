"use client"

import { Button } from "@simplist/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@simplist/ui/components/dialog"
import { Input } from "@simplist/ui/components/input"
import { Label } from "@simplist/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@simplist/ui/components/select"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { inviteProjectMember } from "@/lib/actions/members"
import { useState } from "react"

type Role = {
  id: string
  name: string
  slug: string
  isOwner: boolean
  isDefault: boolean
}

type InviteMemberDialogProps = {
  projectId: string
  roles: Role[]
  onClose: () => void
  onSuccess: (invitation: any) => void
}

export const InviteMemberDialog = ({ projectId, roles, onClose, onSuccess }: InviteMemberDialogProps) => {
  const [email, setEmail] = useState("")
  const [roleId, setRoleId] = useState(roles[0]?.id || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !roleId) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)

    try {
      const invitation = await inviteProjectMember(projectId, { email, roleId })
      toast.success(`Invitation sent to ${email}`)
      onSuccess(invitation)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this project. They'll receive an email with a link to join.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={roleId} onValueChange={setRoleId} disabled={isSubmitting}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The role determines what permissions this member will have.
              </p>
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
                  Sending...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
