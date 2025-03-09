import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { toast } from "@workspace/ui/hooks/use-toast";
import { Loader2, SendIcon, UserRoundPlusIcon } from "lucide-react";
import { ReactElement, useState } from "react";

export const MemberInviteDialog = (): ReactElement => {
  const [pending, setPending] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={"sm"}>Invite members</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2 items-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">
            <UserRoundPlusIcon className="opacity-80" size={16} />
          </div>

          <DialogHeader>
            <DialogTitle className="text-center">
              Invite organization members
            </DialogTitle>

            <DialogDescription className="text-center">
              Invite members to your organization by typing their email addresses.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={async(e) => {
          e.preventDefault()
          setPending(true)

          const formData = new FormData(e.target as HTMLFormElement)
          const email = formData.get("email") as string;

          const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!regex.test(email)) {
            setPending(false)
            return;
          }

          await authClient.organization.inviteMember({
            email,
            role: "member",
            fetchOptions: {
              onRequest: () => setPending(true),
              onSuccess: () => {
                toast({
                  title: "Invitation sent successfully",
                  description: `An invitation has been sent to ${email} to join your organization.`,
                })
                setPending(false);
              },
              onError: (error) => {
                console.error(error)
                toast({
                  title: "Failed to send invitation",
                  description: error.error.message || "An error occurred while sending the invitation.",
                  variant: "destructive",
                })
                setPending(false);
              }
            }
          });
        }}>
          <div className="space-y-1">
            <Label>Invite via email</Label>
            <Input type="email" name="email" placeholder="hi@yourcompany.com" required />
          </div>

          <Button className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
              <>
                <SendIcon /> Send invite
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}