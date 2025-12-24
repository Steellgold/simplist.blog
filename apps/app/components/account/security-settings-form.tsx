"use client";

import { deletePasskey } from "@/lib/actions/security";
import { User } from "@/lib/auth-client";
import { Passkey } from "@better-auth/passkey";
import { Key, TrashBin } from "@gravity-ui/icons";
import { Button } from "@simplist/ui/components/button";
import { Card, CardContent, CardHeader } from "@simplist/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@simplist/ui/components/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@simplist/ui/components/item";
import { Switch } from "@simplist/ui/components/switch";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AddPasskeyDialog } from "./add-passkey-dialog";
import { ChangePasswordDialog } from "./change-password-dialog";
import { Disable2FADialog } from "./disable-2fa-dialog";
import { Enable2FADialog } from "./enable-2fa-dialog";

type Props = {
  user: User;
  hasPassword: boolean;
  passkeys: Passkey[];
};

export const SecuritySettingsForm = ({
  user,
  hasPassword,
  passkeys,
}: Props) => {
  const router = useRouter();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAddPasskeyDialog, setShowAddPasskeyDialog] = useState(false);
  const [showEnable2FADialog, setShowEnable2FADialog] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(
    user.twoFactorEnabled ?? false,
  );

  const handleAddPasskey = () => {
    setShowAddPasskeyDialog(true);
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    toast.promise(deletePasskey(passkeyId), {
      loading: "Deleting passkey...",
      success: () => {
        router.refresh();
        return "Passkey deleted successfully";
      },
      error: (err) => {
        const message =
          err instanceof Error ? err.message : "Failed to delete passkey";
        return message;
      },
    });
  };

  const handleConfigure2FA = () => {
    setShowEnable2FADialog(true);
  };

  const handleDisable2FA = () => {
    setShowDisable2FADialog(true);
  };

  const formatDeviceType = (deviceType: string) => {
    return deviceType.charAt(0).toUpperCase() + deviceType.slice(1);
  };

  return (
    <>
      <Card>
        <CardHeader className="mb-4">
          <FieldLabel className="text-base font-medium">Security</FieldLabel>
          <FieldDescription className="mt-1">
            Manage your password, passkeys and two-factor authentication.
          </FieldDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            {/* Change/Set Password */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel>Password</FieldLabel>
                <FieldDescription>
                  {hasPassword
                    ? "Change your account password."
                    : "Set a password for your account."}
                </FieldDescription>
              </FieldContent>

              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
              >
                {hasPassword ? "Change Password" : "Set Password"}
              </Button>
            </Field>

            <FieldSeparator />

            {/* Passkeys */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel>Passkeys</FieldLabel>
                <FieldDescription>
                  {passkeys.length === 0
                    ? "Set up passkeys to sign in securely without a password."
                    : "Manage your passkeys for passwordless authentication."}
                </FieldDescription>
              </FieldContent>

              <Button variant="outline" onClick={handleAddPasskey}>
                Add Passkey
              </Button>
            </Field>

            {/* Passkey List */}
            {passkeys.length > 0 && (
              <ItemGroup>
                {passkeys.map((passkey) => (
                  <Item key={passkey.id} variant="outline">
                    <ItemMedia variant="icon">
                      <Key />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>
                        {passkey.name ||
                          `${formatDeviceType(passkey.deviceType)} Passkey`}
                      </ItemTitle>
                      <ItemDescription>
                        {formatDeviceType(passkey.deviceType)}
                        Added {new Date(passkey.createdAt).toLocaleDateString()}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => handleDeletePasskey(passkey.id)}
                      >
                        <TrashBin className="size-4" />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </ItemGroup>
            )}

            <FieldSeparator />

            {/* Two-Factor Authentication */}
            <Field orientation="responsive">
              <FieldContent>
                <FieldLabel>Two-Factor Authentication</FieldLabel>
                <FieldDescription>
                  {user.twoFactorEnabled
                    ? "You'll need to enter a code from your authenticator app when signing in."
                    : "Enable it to add an extra layer of security."}
                </FieldDescription>
              </FieldContent>

              <div className="flex items-center gap-2">
                <Switch
                  checked={is2FAEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleConfigure2FA();
                    } else {
                      handleDisable2FA();
                    }
                  }}
                />
              </div>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        hasPassword={hasPassword}
      />

      <AddPasskeyDialog
        open={showAddPasskeyDialog}
        onOpenChange={setShowAddPasskeyDialog}
        userName={user.name}
      />

      <Enable2FADialog
        open={showEnable2FADialog}
        onOpenChange={setShowEnable2FADialog}
        onEnabled={() => setIs2FAEnabled(true)}
      />

      <Disable2FADialog
        open={showDisable2FADialog}
        onOpenChange={setShowDisable2FADialog}
        onDisabled={() => setIs2FAEnabled(false)}
      />
    </>
  );
};
