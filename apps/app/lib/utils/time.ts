/**
 * Format the time remaining until a scheduled date
 * @param scheduledAt - The scheduled date or null
 * @returns A human-readable string representing the time remaining
 */
export const formatTimeRemaining = (scheduledAt: Date | null): string => {
  if (!scheduledAt) return "";
  const diff = scheduledAt.getTime() - Date.now();
  if (diff <= 0) return "less than an hour";

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 2) return `${days} day${days > 1 ? "s" : ""}`;
  if (days > 0)
    return `${days} day${days > 1 ? "s" : ""}${hours > 0 ? ` and ${hours}h` : ""}`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} minutes`;
};
