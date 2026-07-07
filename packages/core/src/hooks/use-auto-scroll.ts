/* oxlint-disable eslint/func-style -- function declarations */
import { useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
  isLoading: boolean;
  dependency: number;
  isStreaming: () => boolean;
  threshold?: number;
  intervalMs?: number;
}

/**
 * Custom hook to auto-scroll to a target element and pause when the user scrolls away.
 *
 * @example
 * ```tsx
 * const { anchorRef, isAutoScroll } = useAutoScroll({
 *    isLoading: status === 'submitted' || status === 'streaming',
 *    dependency: messages.length,
 *    isStreaming: () => status === 'streaming',
 *  });
 * ```
 */
export function useAutoScroll({
  isLoading,
  dependency,
  isStreaming,
  threshold = 162,
  intervalMs = 100,
}: UseAutoScrollOptions) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  // Detect user scroll to toggle auto-scroll
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const anchor = anchorRef.current;
    if (!anchor) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsAutoScroll(entry.isIntersecting);
        }
      },
      {
        root: null,
        rootMargin: `0px 0px -${threshold}px 0px`,
        threshold: 0,
      }
    );
    observer.observe(anchor);
    return () => {
      observer.disconnect();
    };
  }, [threshold, dependency]);
  // Auto-scroll on updates and during streaming
  useEffect(() => {
    if (!isAutoScroll) {
      return;
    }
    const scrollToBottom = () => {
      anchorRef.current?.scrollIntoView({
        behavior: dependency > 5 ? "instant" : "smooth",
      });
    };
    scrollToBottom();
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (isAutoScroll && isStreaming() && isLoading) {
      intervalId = setInterval(scrollToBottom, intervalMs);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [dependency, isLoading, isAutoScroll, isStreaming, intervalMs]);
  return { anchorRef, isAutoScroll };
}
