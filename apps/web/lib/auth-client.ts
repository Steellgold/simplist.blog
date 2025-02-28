import { ac,  admin, editor, member, owner, Permissions } from "./permissions";
import { organizationClient, multiSessionClient, passkeyClient, twoFactorClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      ac: ac,
      roles: { member, editor, admin, owner }
    }),
    multiSessionClient(),
    passkeyClient(),
    twoFactorClient()
  ],
  baseURL: process.env.PUBLIC_BETTER_AUTH_URL!,
});

export const can = async (permission: Permissions): Promise<boolean> => {
  const response = await authClient.organization.hasPermission({ permission });

  if (response.error) return false;
  if (response.data.success) return true;
  return false;
}

export type Session = typeof authClient.$Infer.Session
export type Organization = typeof authClient.$Infer.Organization

export type Member = typeof authClient.$Infer.Member & {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  }  
}

export type Invitation = typeof authClient.$Infer.Invitation