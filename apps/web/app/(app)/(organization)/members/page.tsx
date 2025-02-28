import { BreadcrumbSetter } from "@workspace/ui/components/setter-breadcrumb";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { MembersTable } from "./_sections/members.table.card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { checkPermission } from "@/lib/check-permission";
import { Member } from "@/lib/auth-client";

const OrganizationMembers = async() => {
  const [session, organization] =
    await Promise.all([
      auth.api.getSession({ headers: await headers() }),
      auth.api.getFullOrganization({ headers: await headers() })
    ]);

  if (!organization || !session) {
    unauthorized();
  }

  await checkPermission({
    organizationId: organization.id,
    permission: { members: ["view"], },
  })

  return (
    <>
      <BreadcrumbSetter
        items={[
          { label: "Organization", href: "/" },
          { label: "Members" }
        ]} 
      />
      
      <div className="space-y-6">
        {/* <PageHeader
          title=""
          description=""
          action={
            <Button onClick={() => console.log("Invite member clicked")} size={"sm"}>
              <Plus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          }
        /> */}
        
        <MembersTable members={organization.members as Member[]} session={session} />

        {/* <InviteDialog 
          open={inviteDialogOpen} 
          onOpenChange={setInviteDialogOpen}
          onSubmit={handleInviteSubmit}
        />

        
        <InvitationTable 
          invitations={invitations}
          visible={pendingInvitationsVisible}
          onToggleVisibility={() => setPendingInvitationsVisible(!pendingInvitationsVisible)}
          onCancelInvitation={handleCancelInvitation}
          onResendInvitation={handleResendInvitation}
          onCopyInviteLink={copyInviteLink}
        /> */}
      </div>
    </>
  );
};

const LoadingState = () => (
  <>
    <BreadcrumbSetter 
      items={[
        { label: "Organization", href: "/" },
        { label: "Members" }
      ]} 
    />
    <div className="space-y-6">
      <Skeleton className="h-64" />
      <Skeleton className="h-48" />
    </div>
  </>
);


export default OrganizationMembers;