"use client"

import { authClient } from "@/lib/auth-client"
import { cn, getRedirectUrl } from "@/lib/utils"
import { Button } from "@simplist/ui/components/button"
import { Spinner } from "@simplist/ui/components/spinner"
import { useState } from "react"
import { GitHubLight, GitHubDark, Google } from "@ridemountainpig/svgl-react"
import { IconThemed } from "@simplist/ui/components/icon-themed"

type ProviderType = "github" | "google"

interface ProviderButtonProps {
  type: ProviderType
  onAuthStart?: () => void
  onAuthEnd?: () => void
  disabled?: boolean
  isLastUsed?: boolean
  variant?: "login" | "register"
}

const providerConfig = {
  github: {
    name: "GitHub",
    icon: (<IconThemed dark={<GitHubDark className="size-4" />} light={<GitHubLight className="size-4" />} />),
  },
  google: {
    name: "Google",
    icon: <Google className="size-4" />,
  },
}

export const ProviderButton = ({
  type,
  onAuthStart,
  onAuthEnd,
  disabled,
  isLastUsed,
  variant = "login",
}: ProviderButtonProps) => {
  const [loading, setLoading] = useState(false)
  const config = providerConfig[type]

  const handleClick = async () => {
    setLoading(true)
    onAuthStart?.()

    try {
      await authClient.signIn.social({
        provider: type,
        callbackURL: getRedirectUrl(),
      })
    } catch (error) {
      console.error(`Failed to login with ${type}:`, error)
    } finally {
      setLoading(false)
      onAuthEnd?.()
    }
  }

  return (
    <Button
      variant="secondary"
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className="relative w-full"
    >
      <div className="flex items-center gap-2">
        {loading ? <Spinner /> : config.icon}
        {variant === "register" ? "Sign up with" : "Login with"} {config.name}
      </div>

      {variant === "login" && isLastUsed && (
        <LastUsedBadge />
      )}
    </Button>
  )
}

const LastUsedBadge = () => {
  return (
    <span className={cn(
      "absolute top-1/2 right-2 -translate-y-1/2",
      "rounded-md bg-primary/10 px-2 py-0.5",
      "text-xs font-medium text-primary",
      "border border-border whitespace-nowrap"
    )}>
      Last used
    </span>
  )
}