"use client"

import { acceptProjectInvitation, declineProjectInvitation } from "@/lib/actions/members"
import { Button } from "@simplist/ui/components/button"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Spinner } from "@simplist/ui/components/spinner"
import { useState } from "react"
import { toast } from "sonner"
import { CardFooter } from "@simplist/ui/components/card"

type InvitationActionsProps = {
  token: string
  projectSlug: string
}

export const InvitationActions = ({ token, projectSlug }: InvitationActionsProps) => {
  const router = useRouter()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await acceptProjectInvitation(token)
      toast.success("Invitation accepted! Redirecting to project...")
      router.push(`/${projectSlug}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept invitation")
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    try {
      const result = await declineProjectInvitation(token)
      toast.success(`Invitation to ${result.projectName} declined`)
      router.push("/")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to decline invitation")
      setIsDeclining(false)
    }
  }

  const isLoading = isAccepting || isDeclining

  return (
    <CardFooter className="flex flex-col sm:flex-row gap-3">
      <Button
        onClick={handleAccept}
        disabled={isLoading}
        className="flex-1"
      >
        {isAccepting ? (
          <>
            <Spinner />
            Accepting...
          </>
        ) : (
          <>
            <CheckCircle />
            Accept Invitation
          </>
        )}
      </Button>
      <Button
        onClick={handleDecline}
        disabled={isLoading}
        variant="outline"
        className="flex-1"
      >
        {isDeclining ? (
          <>
            <Spinner />
            Declining...
          </>
        ) : (
          <>
            <XCircle />
            Decline
          </>
        )}
      </Button>
    </CardFooter>
  )
}