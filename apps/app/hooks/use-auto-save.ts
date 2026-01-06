import { useEffect, useRef, useState } from "react";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

type UseAutoSaveOptions = {
  delay?: number;
  enabled?: boolean;
};

type UseAutoSaveReturn = {
  status: AutoSaveStatus;
  lastSaved: Date | null;
};

/**
 * Hook for auto-saving data with debounce
 *
 * @param value - The value to watch for changes and auto-save
 * @param onSave - Async function to call when saving
 * @param options - Configuration options
 * @param options.delay - Debounce delay in milliseconds (default: 2000)
 * @param options.enabled - Whether auto-save is enabled (default: true)
 * @returns Object with status and lastSaved timestamp
 *
 * @example
 * ```tsx
 * const { status, lastSaved } = useAutoSave(
 *   { title, content },
 *   async (data) => {
 *     await updateArticle(data);
 *   },
 *   { delay: 2000, enabled: status === "draft" }
 * );
 * ```
 */
export const useAutoSave = <T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  options: UseAutoSaveOptions = {},
): UseAutoSaveReturn => {
  const { delay = 2000, enabled = true } = options;

  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousValueRef = useRef<T>(value);
  const isSavingRef = useRef(false);
  const onSaveRef = useRef(onSave);

  // Keep onSave ref up to date
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    // Don't auto-save if disabled
    if (!enabled) return;

    // Don't auto-save if value hasn't changed (deep comparison)
    if (JSON.stringify(value) === JSON.stringify(previousValueRef.current)) {
      return;
    }

    // Don't start a new timer if currently saving
    if (isSavingRef.current) {
      return;
    }

    previousValueRef.current = value;

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new debounce timer
    timerRef.current = setTimeout(async () => {
      isSavingRef.current = true;
      setStatus("saving");

      try {
        await onSaveRef.current(value);
        setStatus("saved");
        setLastSaved(new Date());

        // Reset to idle after 3 seconds
        setTimeout(() => {
          setStatus("idle");
        }, 3000);
      } catch (error) {
        setStatus("error");
        console.error("Auto-save failed:", error);

        // Reset to idle after 5 seconds even on error
        setTimeout(() => {
          setStatus("idle");
        }, 5000);
      } finally {
        isSavingRef.current = false;
      }
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay, enabled]);

  return { status, lastSaved };
};
