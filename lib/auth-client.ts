import { inferAdditionalFields, lastLoginMethodClient, passkeyClient, twoFactorClient, usernameClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"
import { InferUser } from "better-auth"

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient(),
    twoFactorClient(),
    passkeyClient(),
    inferAdditionalFields<typeof auth>(),
  ]
})

export type User = InferUser<typeof auth>