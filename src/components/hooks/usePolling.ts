import { useCallback, useEffect, useRef } from "react";

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number;
  onError?: (error: Error) => void;
}

export function usePolling(
  callback: () => Promise<void>,
  { enabled = true, interval = 30000, onError }: UsePollingOptions = {}
) {
  const timeoutRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      await callback();
    } catch (err) {
      if (onError && err instanceof Error) {
        onError(err);
      }
    }

    if (enabled) {
      timeoutRef.current = window.setTimeout(poll, interval);
    }
  }, [callback, enabled, interval, onError]);

  useEffect(() => {
    if (enabled) {
      poll();
    }

    return () => stop();
  }, [enabled, poll, stop]);

  return { stop };
}
