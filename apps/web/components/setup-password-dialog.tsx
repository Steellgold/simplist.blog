"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { PasswordInput } from "@workspace/ui/components/input-password";
import { Input } from "@workspace/ui/components/input";
import { Component } from "@workspace/ui/components/utils/component";
import { toast } from "@workspace/ui/hooks/use-toast";
import { CircleAlert, Loader2 } from "lucide-react";
import { PropsWithChildren, useState } from "react";

type SetupAccountPasswordDialogProps = PropsWithChildren & {
  action: (password: string, confirmPassword: string) => void | Promise<void>;
  confirmationPhrase?: string;
}

export const SetupAccountPasswordDialog: Component<SetupAccountPasswordDialogProps> = ({ 
  children, 
  action, 
  confirmationPhrase
}) => {
  const [isPending, setPending] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [phraseValue, setPhraseValue] = useState("");
  const [phraseError, setPhraseError] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);

  const handlePhraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhraseValue(e.target.value);
    setPhraseError(false);
  };

  const resetForm = () => {
    setOpen(!isOpen);
    setPending(false);
    setPhraseValue("");
    setPhraseError(false);
    setPasswordMismatch(false);
  };

  return (
    <Dialog onOpenChange={resetForm} open={isOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
            <CircleAlert className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Set up account password
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Your account was created using an external provider. Please set up a password for your account.
              {confirmationPhrase && " Additionally, please type the confirmation phrase exactly as shown."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          className="space-y-5"
          onSubmit={async(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            const inputs = Array.from(formData.values());
            const password = inputs[0] as string;
            const confirmPassword = inputs[1] as string;

            let hasError = false;
            
            if (password !== confirmPassword) {
              setPasswordMismatch(true);
              hasError = true;
              toast({
                title: "Passwords don't match",
                description: "Please ensure both passwords match exactly.",
                variant: "destructive"
              });
              return;
            }
            
            if (confirmationPhrase && phraseValue !== confirmationPhrase) {
              setPhraseError(true);
              hasError = true;
              toast({
                title: "Confirmation failed",
                description: "The confirmation phrase doesn't match. Please try again.",
                variant: "destructive"
              });
              return;
            }
            
            if (hasError) return;

            try {
              setPending(true);
              toast({
                title: "Setting up your password",
                description: "Please wait while we configure your account.",
              });
              
              await action(password, confirmPassword);
              
              toast({
                title: "Password set successfully",
                description: "Your account is now secured with a password.",
              });
              
              setOpen(false);
            } catch (error) {
              console.error(error);
              setPending(false);
              toast({
                title: "Setup failed",
                description: "We couldn't set up your password. Please try again.",
                variant: "destructive"
              });
            }
          }}
        >
          <PasswordInput label="Create a new password" showForgotPassword={false} />
          
          <PasswordInput label="Confirm password" showForgotPassword={false} />

          {passwordMismatch && (
            <p className="text-sm text-red-500">
              Passwords do not match. Please try again.
            </p>
          )}
          
          {confirmationPhrase && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Type
                &quot;
                <span className="select-none font-semibold">{confirmationPhrase}</span>
                &quot;
                to confirm
              </label>
              <Input
                value={phraseValue}
                onChange={handlePhraseChange}
                className={phraseError ? "border-red-500" : ""}
                placeholder={`Type ${confirmationPhrase}`}
                autoComplete="off"
              />
              {phraseError && (
                <p className="text-sm text-red-500">
                  Please type the exact phrase: {confirmationPhrase}
                </p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Set Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}