import { passkeyClient } from "@better-auth/passkey/client"
import { InferUser } from "better-auth"
import { inferAdditionalFields, lastLoginMethodClient, twoFactorClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { auth } from "./auth"

export const authClient = createAuthClient({
  plugins: [
    lastLoginMethodClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/2fa-verify"
      }
    }),
    passkeyClient(),
    inferAdditionalFields<typeof auth>(),
  ]
})

export type User = InferUser<typeof auth>