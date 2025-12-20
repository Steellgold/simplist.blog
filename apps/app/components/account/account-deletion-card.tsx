"use client";

import {
  cancelAccountDeletion,
  requestAccountDeletion,
} from "@/lib/actions/account-deletion";
import { authClient, type User } from "@/lib/auth-client";
import { formatTimeRemaining } from "@/lib/utils/time";
import {
  RequestAccountDeletionInput,
  requestAccountDeletionSchema,
} from "@/lib/validations/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@simplist/ui/components/alert";
import { Badge } from "@simplist/ui/components/badge";
import { Button } from "@simplist/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@simplist/ui/components/field";
import { Input } from "@simplist/ui/components/input";
import { Kbd } from "@simplist/ui/components/kbd";
import { toast } from "@simplist/ui/components/sonner";
import { Spinner } from "@simplist/ui/components/spinner";
import { AlertTriangle, Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

type OwnedProject = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  user: User;
  ownedProjects: OwnedProject[];
};

export const AccountDeletionCard = ({ user, ownedProjects }: Props) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const scheduledAt = user.deletionScheduledAt
    ? new Date(user.deletionScheduledAt)
    : null;
  const isPendingDeletion = !!scheduledAt && scheduledAt.getTime() > Date.now();

  const timeRemaining = useMemo(
    () => formatTimeRemaining(scheduledAt),
    [scheduledAt],
  );

  const { register, handleSubmit, reset } =
    useForm<RequestAccountDeletionInput>({
      resolver: zodResolver(requestAccountDeletionSchema as any),
      defaultValues: { confirmation: "" },
    });

  const handleRequestDeletion = handleSubmit(async (data) => {
    setIsSubmitting(true);

    toast.promise(requestAccountDeletion(data), {
      loading: "Scheduling account deletion...",
      success: async () => {
        reset();
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push("/auth/login"),
          },
        });
        setIsSubmitting(false);
        return "Account deletion scheduled";
      },
      error: (err) => {
        setIsSubmitting(false);
        return err instanceof Error
          ? err.message
          : "Unable to schedule deletion";
      },
    });
  });

  const handleCancelDeletion = async () => {
    setIsCancelling(true);

    toast.promise(cancelAccountDeletion(), {
      loading: "Cancelling deletion...",
      success: () => {
        setIsCancelling(false);
        router.refresh();
        return "Deletion request cancelled";
      },
      error: (err) => {
        setIsCancelling(false);
        return err instanceof Error ? err.message : "Unable to cancel deletion";
      },
    });
  };

  const hasOwnershipBlocker = ownedProjects.length > 0;

  if (isPendingDeletion) {
    return (
      <Card variant="form-danger">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trash2 className="h-4 w-4" />
            Deletion scheduled
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Your account will be permanently deleted in <b>{timeRemaining}</b>.
          </p>

          <p className="text-muted-foreground text-sm">
            You can cancel the deletion until{" "}
            <b>{scheduledAt?.toLocaleString()}</b>.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleCancelDeletion}
              disabled={isCancelling}
            >
              {isCancelling ? "Cancelling..." : "Cancel deletion"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Account deletion includes a 14-day grace period. You can sign back in
          anytime to cancel.
        </AlertDescription>
      </Alert>

      {hasOwnershipBlocker && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must transfer ownership of the following project
            {ownedProjects.length > 1 ? "s" : ""} before deleting your account.
          </AlertDescription>

          <div className="mt-2 flex flex-wrap gap-2">
            {ownedProjects.map((project) => (
              <Badge key={project.id} variant="outline">
                {project.name}
              </Badge>
            ))}
          </div>
        </Alert>
      )}

      <Card variant="form-danger">
        <CardHeader>
          <FieldLabel className="text-base font-medium">
            Delete account
          </FieldLabel>
          <FieldDescription>
            All data will be permanently removed after 14 days.
          </FieldDescription>
        </CardHeader>

        <CardContent>
          <ul className="text-muted-foreground mb-4 text-sm">
            <li>• Email confirmation immediately</li>
            <li>• Reminder emails during the grace period</li>
            <li>• Final deletion after 14 days</li>
          </ul>

          <FieldGroup>
            <Field orientation="vertical">
              <FieldContent>
                <FieldLabel>Confirmation</FieldLabel>
                <FieldDescription>
                  Type <Kbd>DELETE</Kbd> to confirm.
                </FieldDescription>
              </FieldContent>

              <Input
                placeholder="DELETE"
                {...register("confirmation")}
                disabled={isSubmitting || hasOwnershipBlocker}
              />
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <p className="text-muted-foreground text-sm">
            This action is irreversible. All data will be permanently deleted.
          </p>
          <Button
            onClick={handleRequestDeletion}
            variant="destructive"
            disabled={isSubmitting || hasOwnershipBlocker}
          >
            {isSubmitting ? <Spinner /> : "Delete account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
