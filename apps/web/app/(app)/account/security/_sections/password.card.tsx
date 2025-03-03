"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { useState } from "react";
import { Lock, X } from "lucide-react";
import { SetupAccountPasswordDialog } from "@/components/setup-password-dialog";
import { definePassword } from "@/lib/actions/define-password";
import { Button } from "@workspace/ui/components/button";

export const SectionPasswordCard = () => {

  const [hasPassword] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <div className="flex flex-col">
            <CardTitle>Password</CardTitle>
            <CardDescription>Set up a password for your account.</CardDescription>
          </div>

          <SetupAccountPasswordDialog
            action={(password, confirmPassword) => {
              if (password !== confirmPassword) {
                return;
              }

              definePassword({ password });
            }}
          >
            <Button variant="outline" size={"sm"}>
              <Lock />
              Set up password
            </Button>
          </SetupAccountPasswordDialog>
        </CardHeader>

        <CardContent>
          {!hasPassword && (
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border" aria-hidden="true">
                <X className="h-5 w-5 text-destructive" />
              </div>

              <p className="text-sm text-center">You don&apos;t have a password set up for your account.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};