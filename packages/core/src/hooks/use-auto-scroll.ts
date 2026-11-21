import { noop } from "radashi";
import { useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
  isLoading: boolean;
  dependency: number;
  isStreaming: () => boolean;
  threshold?: number;
  intervalMs?: number;
}

export const useAutoScroll = ({
  isLoading,
  dependency,
  isStreaming,
  threshold = 162,
  intervalMs = 100,
}: UseAutoScrollOptions) => {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  useEffect(() => {
    const anchor = anchorRef.current;

    if (!anchor) {
      return noop;
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
  }, [threshold]);
  useEffect(() => {
    if (!isAutoScroll) {
      return noop;
    }

    const scrollToBottom = () => {
      anchorRef.current?.scrollIntoView({
        behavior: dependency > 5 ? "instant" : "smooth",
      });
    };

    scrollToBottom();
    let intervalId: ReturnType<typeof setInterval> | undefined;

    if (isStreaming() && isLoading) {
      intervalId = setInterval(scrollToBottom, intervalMs);
    }

    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [dependency, isLoading, isAutoScroll, isStreaming, intervalMs]);

  return { anchorRef, isAutoScroll };
};
