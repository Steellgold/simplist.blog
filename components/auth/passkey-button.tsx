"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "@/components/ui/sonner"
import { KeyRoundIcon } from "lucide-react"

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
        router.push("/")
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

