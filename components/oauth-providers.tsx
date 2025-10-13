"use client"

import { Field } from "@/components/ui/field"
import { ProviderButton } from "./provider-button"
import { createContext, useContext, useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"

interface OAuthProvidersContextType {
  isAuthenticating: boolean
  setIsAuthenticating: (value: boolean) => void
}

const OAuthProvidersContext = createContext<OAuthProvidersContextType | null>(null)

export function useOAuthProviders() {
  const context = useContext(OAuthProvidersContext)
  if (!context) {
    throw new Error("useOAuthProviders must be used within OAuthProvidersProvider")
  }
  return context
}

export function OAuthProvidersProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  return (
    <OAuthProvidersContext.Provider value={{ isAuthenticating, setIsAuthenticating }}>
      {children}
    </OAuthProvidersContext.Provider>
  )
}

export function OAuthProviders() {
  const { isAuthenticating, setIsAuthenticating } = useOAuthProviders();
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  useEffect(() => {
    setLastLogin(authClient.getLastUsedLoginMethod());
  }, []);

  return (
    <Field>
      <ProviderButton
        type="github"
        onAuthStart={() => setIsAuthenticating(true)}
        onAuthEnd={() => setIsAuthenticating(false)}
        disabled={isAuthenticating}
        isLastUsed={lastLogin === "github"}
      />

      <ProviderButton
        type="google"
        onAuthStart={() => setIsAuthenticating(true)}
        onAuthEnd={() => setIsAuthenticating(false)}
        disabled={isAuthenticating}
        isLastUsed={lastLogin === "google"}
      />
    </Field>
  )
}
