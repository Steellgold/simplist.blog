"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Badge } from "@workspace/ui/components/badge";
import { PasswordConfirmationDialog } from "@/components/password-confirmation-dialog";
import { fl } from "@workspace/ui/lib/utils";
import { Crown, Loader2, MoreHorizontal, PenSquare, Shield, User, X } from "lucide-react";
import { Member, Session } from "@/lib/auth-client";
import { Component } from "@workspace/ui/components/utils/component";
import { useState } from "react";

type MembersTableProps = {
  members: Member[];
  session: Session;
}

type PendingState = Record<string, boolean>;

export const MembersTable: Component<MembersTableProps> = ({ session, members }) => {
  const [isPending, setIsPending] = useState<PendingState>({});

  const handleChangeMemberRole = async () => {};
  const handleRemoveMember = async () => {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Members</CardTitle>
        <CardDescription>
          Members and their roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <EmptyMembersState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-normal">Member</th>
                    <th className="pb-2 font-normal">Role</th>
                    <th className="pb-2 font-normal">Joined</th>
                    <th className="pb-2 font-normal sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => {
                    const isCurrentUser = member.user.id === session.user.id;
                    const isOwner = member.role === "owner";
                    
                    return (
                      <tr key={member.id} className="text-sm">
                        <td className="py-3 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.user.image} alt={member.user.name} />
                            <AvatarFallback>{fl(member.user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {member.user.name}
                              {isCurrentUser && (
                                <Badge variant="outline" className="text-xs">You</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{member.user.email}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <RoleBadge role={member.role as "owner" | "admin" | "editor" | "member"} />
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {/* {new Date(member.createdAt).toLocaleDateString()} */}
                          {new Date().toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          {!isCurrentUser && (
                            <MemberActions
                              member={member}
                              isPending={isPending[member.id] || false}
                              onChangeMemberRole={handleChangeMemberRole}
                              onRemoveMember={handleRemoveMember}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyMembersState = () => (
  <div className="text-center py-6">
    <User className="mx-auto h-8 w-8 text-muted-foreground" />
    <h3 className="mt-2 text-sm font-semibold">No members</h3>
    <p className="text-sm text-muted-foreground">
      Your organization doesn&apos;t have any members yet. (Wtf, why are you here?)
    </p>
  </div>
);

type RoleBadgeProps = {
  role:
    "owner" |
    "admin" |
    "editor" |
    "member";
}

const RoleBadge: Component<RoleBadgeProps> = ({ role }) => (
  <div className="flex items-center gap-1">
    {role === "owner" && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
    {role === "admin" && <Shield className="h-3.5 w-3.5 text-indigo-500" />}
    {role === "editor" && <PenSquare className="h-3.5 w-3.5 text-blue-500" />}
    {role === "member" && <User className="h-3.5 w-3.5 text-muted-foreground" />}
    <span className="capitalize">{role}</span>
  </div>
);

type MemberActionsProps = {
  member: Member;
  isPending: boolean;
  onChangeMemberRole: (memberId: string, role: "admin" | "member") => void;
  onRemoveMember: (memberId: string) => void;
}

const MemberActions: Component<MemberActionsProps> = ({ member, isPending, onChangeMemberRole, onRemoveMember }) => {
  const isOwner = member.role === "owner";
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {!isOwner && (
          <>
            <DropdownMenuItem
              onSelect={() => onChangeMemberRole(member.id, member.role === "admin" ? "member" : "admin")}
              disabled={isPending}
            >
              {member.role === "admin" ? (
                <>
                  <User className="mr-2 h-4 w-4" />
                  <span>Make Member</span>
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Make Admin</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <PasswordConfirmationDialog
          action={() => onRemoveMember(member.id)}
          actionType="delete"
        >
          <DropdownMenuItem 
            onSelect={(e) => e.preventDefault()}
            className="text-red-600"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            <span>Remove</span>
          </DropdownMenuItem>
        </PasswordConfirmationDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};