"use client"

import { authClient } from "@/lib/auth-client"
import { getRedirectUrl } from "@/lib/utils"
import { Button } from "@simplist/ui/components/button"
import { toast } from "@simplist/ui/components/sonner"
import { Spinner } from "@simplist/ui/components/spinner"
import { KeyRoundIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface PasskeyButtonProps {
  onAuthStart?: () => void
  onAuthEnd?: () => void
  disabled?: boolean
}

export const PasskeyButton = ({ onAuthStart, onAuthEnd, disabled }: PasskeyButtonProps) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    onAuthStart?.()

    try {
      const result = await authClient.signIn.passkey()

      if (result.error) {
        toast.error(result.error.message || "Failed to login with Passkey")
      } else {
        toast.success("Logged in successfully with Passkey")
        router.push(getRedirectUrl())
      }
    } catch (error) {
      console.error("Failed to login with Passkey:", error)
      toast.error("An unexpected error occurred")
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
    >
      {loading ? <Spinner /> : <KeyRoundIcon />}
      Login with Passkey
    </Button>
  )
}

