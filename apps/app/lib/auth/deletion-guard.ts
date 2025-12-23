import { redirect } from "next/navigation";
import type { User } from "../auth-client";

const hasPendingDeletion = (user: Pick<User, "deletionScheduledAt"> | null) => {
  if (!user?.deletionScheduledAt) return false;
  const scheduledAt = new Date(user.deletionScheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return false;
  return scheduledAt.getTime() > Date.now();
};

export const redirectIfPendingDeletion = (
  user: User | null,
  returnPath?: string,
) => {
  if (!hasPendingDeletion(user)) return;

  const params = new URLSearchParams();
  if (returnPath) {
    params.set("redirect", returnPath);
  }

  const target = `/reactivate${params.toString() ? `?${params.toString()}` : ""}`;
  redirect(target);
};
