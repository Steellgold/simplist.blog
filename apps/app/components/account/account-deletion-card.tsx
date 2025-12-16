"use client"

import { cancelAccountDeletion, requestAccountDeletion } from "@/lib/actions/account-deletion"
import { authClient, type User } from "@/lib/auth-client"
import { RequestAccountDeletionInput, requestAccountDeletionSchema } from "@/lib/validations/user"
import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription, AlertTitle } from "@simplist/ui/components/alert"
import { Button } from "@simplist/ui/components/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@simplist/ui/components/card"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@simplist/ui/components/field"
import { Input } from "@simplist/ui/components/input"
import { Textarea } from "@simplist/ui/components/textarea"
import { toast } from "@simplist/ui/components/sonner"
import { Badge } from "@simplist/ui/components/badge"
import { AlertTriangle, Clock, Shield, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { formatTimeRemaining } from "@/lib/utils/time"
import { Kbd } from "@simplist/ui/components/kbd"

type OwnedProject = {
  id: string
  name: string
  slug: string
}

type Props = {
  user: User
  ownedProjects: OwnedProject[]
}

export const AccountDeletionCard = ({ user, ownedProjects }: Props) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const scheduledAt = user.deletionScheduledAt ? new Date(user.deletionScheduledAt) : null
  const isPendingDeletion = !!scheduledAt && scheduledAt.getTime() > Date.now()

  const timeRemaining = useMemo(() => formatTimeRemaining(scheduledAt), [scheduledAt])

  const { register, handleSubmit, reset } = useForm<RequestAccountDeletionInput>({
    resolver: zodResolver(requestAccountDeletionSchema),
    defaultValues: { confirmation: "", reason: "" },
  })

  const handleRequestDeletion = handleSubmit(async (data) => {
    setIsSubmitting(true)

    toast.promise(
      requestAccountDeletion(data), {
        loading: "Scheduling account deletion...",
        success: async () => {
          reset()
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.push("/auth/login")
              },
            },
          })

          setIsSubmitting(false)
          return "Account deletion scheduled."
        },
        error: (err) => {
          setIsSubmitting(false)
          const message = err instanceof Error ? err.message : "Unable to schedule deletion"
          return message
        },
      }
    )
  })

  const handleCancelDeletion = async () => {
    setIsCancelling(true)
    toast.promise(
      cancelAccountDeletion(), {
        loading: "Cancelling deletion...",
        success: () => {
          setIsCancelling(false)
          router.refresh()
          return "Deletion request cancelled"
        },
        error: (err) => {
          setIsCancelling(false)
          const message = err instanceof Error ? err.message : "Unable to cancel deletion"
          return message
        },
      }
    )
  }

  const hasOwnershipBlocker = ownedProjects.length > 0

  if (isPendingDeletion) {
    return (
      <>
        <Card variant="form-danger">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Deletion scheduled
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account will be permanently deleted in <b>{timeRemaining}</b>. You can still cancel before{" "}
              <b>{scheduledAt?.toLocaleString()}</b>.
            </p>

            <p className="text-sm text-muted-foreground">
              You can cancel below to restore access instantly.
            </p>
          </CardContent>

          <CardFooter>
            <Button variant="outline" onClick={handleCancelDeletion}>
              {isCancelling ? "Cancelling..." : "Cancel deletion"}
            </Button>
          </CardFooter>
        </Card>

        <Card variant="form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Deletion scheduled
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your account will be permanently deleted in <b>{timeRemaining}</b>. You can still cancel before{" "}
              <b>{scheduledAt?.toLocaleString()}</b>.
            </p>

            <p className="text-sm text-muted-foreground">
              You can cancel below to restore access instantly.
            </p>
          </CardContent>

          <CardFooter>
            <Button variant="outline" onClick={handleCancelDeletion}>
              {isCancelling ? "Cancelling..." : "Cancel deletion"}
            </Button>
          </CardFooter>
        </Card>
      
      </>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Account deletion with 14-day grace period</AlertTitle>
        <AlertDescription>
          Once requested, your account is disabled for 14 days. You can sign back in anytime during the window to cancel the deletion.
        </AlertDescription>
      </Alert>

      {hasOwnershipBlocker && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Transfer project ownership first</AlertTitle>
          <AlertDescription>
            You own the following project{ownedProjects.length > 1 ? "s" : ""}. Transfer ownership before scheduling
            deletion.
          </AlertDescription>

          <div className="mt-3 flex flex-wrap gap-2">
            {ownedProjects.map((project) => (
              <Badge key={project.id} variant="outline">
                {project.name}
              </Badge>
            ))}
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete your account
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Delete your account. All projects, articles, analytics, and API keys will be permanently removed after
            the 14-day grace period.
          </p>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>What happens</AlertTitle>
              <AlertDescription>
                Immediate email confirmation, reminders on day 7 and 10, and a final warning 1 hour before deletion.
                Cancel anytime before the deadline.
              </AlertDescription>
            </Alert>

            {isPendingDeletion ? (
              <div className="rounded-md border border-dashed p-4">
                <p className="font-medium">Deletion is scheduled for {scheduledAt?.toLocaleString()}.</p>
                <p className="text-sm text-muted-foreground">
                  You can cancel below to restore access instantly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestDeletion} className="space-y-4">
                <FieldGroup>
                  <Field orientation="vertical">
                    <FieldContent>
                      <FieldLabel>Confirmation</FieldLabel>
                      <FieldDescription>
                        Type <Kbd>DELETE</Kbd> to confirm you want to start the deletion timer.
                      </FieldDescription>
                    </FieldContent>
                    <Input
                      placeholder="DELETE"
                      {...register("confirmation")}
                      disabled={isSubmitting || hasOwnershipBlocker}
                    />
                  </Field>

                  <Field orientation="vertical">
                    <FieldContent>
                      <FieldLabel>Optional reason</FieldLabel>
                      <FieldDescription>
                        Share why you are leaving (helps us improve).
                      </FieldDescription>
                    </FieldContent>
                    <Textarea
                      rows={3}
                      placeholder="Let us know why you are closing your account"
                      {...register("reason")}
                      disabled={isSubmitting || hasOwnershipBlocker}
                    />
                  </Field>
                </FieldGroup>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Permanent deletion after 14 days</AlertTitle>
                  <AlertDescription>
                    All data will be deleted and cannot be recovered. Billing records may be retained as required by law.
                  </AlertDescription>
                </Alert>

                <CardFooter className="px-0">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSubmitting || hasOwnershipBlocker}
                  >
                    {isSubmitting ? "Scheduling..." : "Start deletion timer"}
                  </Button>
                </CardFooter>
              </form>
            )}
          </div>
        </CardContent>

        {isPendingDeletion && (
          <CardFooter className="flex flex-col items-start gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDeletion}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel deletion"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Cancelling will immediately restore full access to your projects.
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}