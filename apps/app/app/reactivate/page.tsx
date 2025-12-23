import { ReactivateActions } from "@/components/account/reactivate-actions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@simplist/ui/components/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@simplist/ui/components/card";
import { AlertTriangle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth-helper";
import { redirect } from "next/navigation";
import { formatTimeRemaining } from "@/lib/utils/time";

const ReactivatePage = async () => {
  const user = await getCurrentUser();
  const scheduledAt = user?.deletionScheduledAt
    ? new Date(user.deletionScheduledAt)
    : null;
  const hasPendingDeletion =
    !!scheduledAt && scheduledAt.getTime() > Date.now();

  // If logged in but no pending deletion, go home
  if (user && !hasPendingDeletion) {
    redirect("/");
  }

  const timeRemaining = formatTimeRemaining(scheduledAt);

  // Not logged in: Redirect to login
  if (!user) {
    redirect("/auth/login?redirect=/reactivate");
  }

  // Logged in with pending deletion: show reactivation card
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Reactivate your account</CardTitle>
          <CardDescription>
            Your account is scheduled for deletion. You can cancel before the
            deadline.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Deletion scheduled</AlertTitle>
            <AlertDescription>
              Your account will be permanently deleted in {timeRemaining}
              {scheduledAt
                ? ` (scheduled at ${scheduledAt.toLocaleString()})`
                : ""}
              .
            </AlertDescription>
          </Alert>

          <div className="text-muted-foreground space-y-2 text-sm">
            <p>
              Cancel now to restore full access. If you do nothing, all
              projects, articles, analytics, and API keys will be removed.
            </p>
          </div>
        </CardContent>

        <ReactivateActions hasPendingDeletion={hasPendingDeletion} />
      </Card>
    </div>
  );
};

export default ReactivatePage;
