import { getInvitationDetails } from "@/lib/actions/members";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@simplist/ui/components/avatar";
import { getInitials } from "@simplist/ui/lib/utils";
import { XCircle, X, MoveHorizontal } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@simplist/ui/components/button";
import { InvitationActions } from "@/components/members/invitation-actions";
import { IconRender } from "@simplist/ui/components/icon-renderer";
import { getColorValue } from "@simplist/ui/lib/color";

type PageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitationPage({ params }: PageProps) {
  const { token } = await params;

  let invitation: Awaited<ReturnType<typeof getInvitationDetails>> | null =
    null;
  let error: string | null = null;

  try {
    invitation = await getInvitationDetails(token);
  } catch (err) {
    // Re-throw Next.js redirect errors to allow proper redirection
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    error = err instanceof Error ? err.message : "Failed to load invitation";
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-4 flex items-center justify-center">
              <XCircle className="text-destructive" />
            </div>

            <CardTitle className="text-center">Invitation Error</CardTitle>

            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center">
            <Link href="/" className={buttonVariants({ variant: "default" })}>
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectIconUrl = invitation?.projectIcon
    ? invitation.projectIcon
    : `https://avatar.vercel.sh/${invitation?.projectName.toLowerCase().replaceAll(" ", "")}`;

  const inviterImageUrl = invitation?.inviterImage
    ? invitation.inviterImage
    : `https://avatar.vercel.sh/${invitation?.inviterName.toLowerCase().replaceAll(" ", "")}?rounded=60`;

  const invitedUserImageUrl = invitation?.invitedUserImage
    ? invitation.invitedUserImage
    : `https://avatar.vercel.sh/${invitation?.invitedUserName.toLowerCase().replaceAll(" ", "")}?rounded=60`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex items-center justify-center gap-8 py-8">
        {/* Project + Inviter avatar stack */}
        <div className="flex flex-col items-center gap-3">
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-6.5 *:data-[slot=avatar]:size-16 *:data-[slot=avatar]:ring-4">
            <Avatar data-slot="avatar">
              <AvatarImage
                src={invitation?.projectIcon.imageUrl || ""}
                alt={invitation?.projectName}
              />
              <AvatarFallback
                style={{
                  backgroundColor: getColorValue(
                    invitation?.projectIcon.backgroundColor ?? "YELLOW",
                  ),
                }}
              >
                <IconRender
                  name={invitation?.projectIcon.iconName || "building-2"}
                  className="size-6"
                />
              </AvatarFallback>
            </Avatar>
            <Avatar data-slot="avatar">
              <AvatarImage
                src={inviterImageUrl}
                alt={invitation?.inviterName}
              />
              <AvatarFallback>
                {getInitials(invitation?.inviterName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold">{invitation?.projectName}</p>
            <p className="text-muted-foreground text-sm">
              {invitation?.inviterName}
            </p>
          </div>
        </div>

        {/* X symbol */}
        <div className="bg-muted/10 rounded-full p-1.5">
          <MoveHorizontal className="text-muted-foreground size-5" />
        </div>

        {/* Invited user */}
        <div className="flex flex-col items-center gap-3">
          <Avatar className="ring-background size-16">
            <AvatarImage
              src={invitedUserImageUrl}
              alt={invitation?.invitedUserName}
            />
            <AvatarFallback>
              {getInitials(invitation?.invitedUserName)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center">
            <p className="text-lg font-bold">You</p>
            <p className="text-muted-foreground text-sm">
              {invitation?.invitedUserName}
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Project Invitation
          </CardTitle>
          <CardDescription className="text-center">
            You've been invited by {invitation?.inviterName} to join a project
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-muted/35 -gap-2 flex flex-col items-center rounded-md p-4">
            <p className="text-muted-foreground text-sm">You will join as</p>
            <p className="text-xl font-semibold">{invitation?.roleName}</p>
          </div>
        </CardContent>

        <InvitationActions
          token={token}
          projectSlug={invitation?.projectSlug || ""}
        />
      </Card>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        This invitation expires on{" "}
        {invitation?.expiresAt
          ? new Date(invitation.expiresAt).toLocaleDateString()
          : ""}
      </p>
    </div>
  );
}
