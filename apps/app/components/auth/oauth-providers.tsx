"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ButtonGroup } from "@simplist/ui/components/button-group"
import { Field } from "@simplist/ui/components/field"
import { ProviderButton } from "./provider-button"
import { PasskeyButton } from "./passkey-button"
import { authClient } from "@/lib/auth-client"

interface OAuthProvidersContextType {
  isAuthenticating: boolean
  setIsAuthenticating: (value: boolean) => void
}

const OAuthProvidersContext = createContext<OAuthProvidersContextType | null>(null)

export const useOAuthProviders = () => {
  const context = useContext(OAuthProvidersContext)
  if (!context) {
    throw new Error("useOAuthProviders must be used within OAuthProvidersProvider")
  }
  return context
}

export const OAuthProvidersProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  return (
    <OAuthProvidersContext.Provider value={{ isAuthenticating, setIsAuthenticating }}>
      {children}
    </OAuthProvidersContext.Provider>
  )
}

interface OAuthProvidersProps {
  variant?: "login" | "register"
}

export const OAuthProviders = ({ variant = "login" }: OAuthProvidersProps) => {
  const { isAuthenticating, setIsAuthenticating } = useOAuthProviders();
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    setLastLogin(authClient.getLastUsedLoginMethod());
  }, []);

  return (
    <Field className="gap-2">
      <ButtonGroup orientation="vertical">
        <ProviderButton
          type="github"
          onAuthStart={() => setIsAuthenticating(true)}
          onAuthEnd={() => setIsAuthenticating(false)}
          disabled={isAuthenticating}
          isLastUsed={lastLogin === "github"}
          variant={variant}
        />

        <ProviderButton
          type="google"
          onAuthStart={() => setIsAuthenticating(true)}
          onAuthEnd={() => setIsAuthenticating(false)}
          disabled={isAuthenticating}
          isLastUsed={lastLogin === "google"}
          variant={variant}
        />
      </ButtonGroup>

      {variant === "login" && (
        <>
          <PasskeyButton
            onAuthStart={() => setIsAuthenticating(true)}
            onAuthEnd={() => setIsAuthenticating(false)}
            disabled={isAuthenticating}
          />
        </>
      )}
    </Field>
  )
}
