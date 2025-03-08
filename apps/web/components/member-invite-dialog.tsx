import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { SendIcon, UserRoundPlusIcon } from "lucide-react";
import { ReactElement, useRef } from "react";

export const MemberInviteDialog = (): ReactElement => {
  const lastInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size={"sm"}>Invite members</Button>
      </DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          lastInputRef.current?.focus();
        }}
      >
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

        <form className="space-y-5">
          <div className="space-y-1">
            <Label>Invite via email</Label>
            <Input />
          </div>

          <Button type="button" className="w-full">
            <SendIcon /> Send invite
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}