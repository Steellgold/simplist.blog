"use client";

import { inviteProjectMember } from "@/lib/actions/members";
import { Plus, Xmark } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@simplist/ui/components/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupSelect,
} from "@simplist/ui/components/input-group";
import { Label } from "@simplist/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@simplist/ui/components/select";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
  isDefault: boolean;
};

type InviteMemberDialogProps = {
  projectId: string;
  roles: Role[];
  onClose: () => void;
  onSuccess?: () => void;
};

type EmailInvitation = {
  email: string;
  roleId: string;
};

export const InviteMemberDialog = ({
  projectId,
  roles,
  onClose,
  onSuccess,
}: InviteMemberDialogProps) => {
  const router = useRouter();
  const [invitations, setInvitations] = useState<EmailInvitation[]>([
    { email: "", roleId: roles[0]?.id || "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addInvitation = () => {
    setInvitations([...invitations, { email: "", roleId: roles[0]?.id || "" }]);
  };

  const removeInvitation = (index: number) => {
    if (invitations.length > 1) {
      setInvitations(invitations.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newInvitations = [...invitations];
    newInvitations[index].email = value;
    setInvitations(newInvitations);
  };

  const updateRole = (index: number, roleId: string) => {
    const newInvitations = [...invitations];
    newInvitations[index].roleId = roleId;
    setInvitations(newInvitations);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty emails
    const validInvitations = invitations.filter(
      (inv) => inv.email.trim() !== "" && inv.roleId,
    );

    if (validInvitations.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    setIsSubmitting(true);

    try {
      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const invitation of validInvitations) {
        try {
          await inviteProjectMember(projectId, {
            email: invitation.email.trim(),
            roleId: invitation.roleId,
          });
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(
            `${invitation.email}: ${error instanceof Error ? error.message : "Failed"}`,
          );
        }
      }

      if (successCount > 0) {
        toast.success(
          `${successCount} invitation${successCount > 1 ? "s" : ""} sent successfully`,
        );
        router.refresh();
        if (onSuccess) onSuccess();
        onClose();
      }

      if (failCount > 0) {
        errors.forEach((error) => toast.error(error));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send invitations",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send invitations to collaborate on this project. Each person will
              receive an email with a link to join.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Invitations</Label>
              <div className="space-y-2">
                {invitations.map((invitation, index) => (
                  <InputGroup key={index}>
                    <Select
                      defaultValue={invitation.roleId}
                      onValueChange={(value) => updateRole(index, value)}
                      disabled={isSubmitting}
                    >
                      <InputGroupSelect>
                        <SelectValue />
                      </InputGroupSelect>

                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <InputGroupInput
                      type="email"
                      placeholder="colleague@example.com"
                      value={invitation.email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      disabled={isSubmitting}
                    />

                    {invitations.length > 1 && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => removeInvitation(index)}
                          disabled={isSubmitting}
                        >
                          <Xmark />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addInvitation}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Plus />
                  Add Another Invitation
                </Button>
              </div>

              <p className="text-muted-foreground text-sm">
                Each person will receive an email with a link to join your
                project.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner />
                  Sending...
                </>
              ) : (
                `Send Invitation${invitations.filter((inv) => inv.email.trim()).length > 1 ? "s" : ""}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
