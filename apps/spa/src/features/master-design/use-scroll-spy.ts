import { noop } from "radashi";
import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

const THRESHOLD_RATIO = 0.2;

const SETTLE_MS = 150;

const isPageBottom = () =>
  window.innerHeight + window.scrollY >=
  document.documentElement.scrollHeight - 2;

const sectionTop = (id: string) =>
  document.querySelector(`#${id}`)?.getBoundingClientRect().top;

const firstId = (ids: string[]) => ids[0] ?? null;
const lastId = (ids: string[]) => ids.at(-1) ?? null;

const idAtThreshold = (ids: string[], line: number): string | null => {
  let current = firstId(ids);

  for (const id of ids) {
    if ((sectionTop(id) ?? Number.POSITIVE_INFINITY) <= line) {
      current = id;
    }
  }

  return current;
};

const activeSectionId = (ids: string[]): string | null =>
  isPageBottom()
    ? lastId(ids)
    : idAtThreshold(ids, window.innerHeight * THRESHOLD_RATIO);

const suppress = (
  suppressedRef: RefObject<boolean>,
  settleTimer: RefObject<ReturnType<typeof setTimeout> | null>
) => {
  suppressedRef.current = true;

  if (settleTimer.current) {
    clearTimeout(settleTimer.current);
  }

  settleTimer.current = setTimeout(() => {
    suppressedRef.current = false;
  }, SETTLE_MS);
};

interface ScrollSpy {
  activeId: string | null;
  scrollTo: (_sectionId: string) => void;
}

export const useScrollSpy = (ids: string[]): ScrollSpy => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const suppressedRef = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suppressUntilSettled = () => {
    suppress(suppressedRef, settleTimer);
  };

  useEffect(() => {
    if (ids.length === 0) {
      return noop;
    }

    const compute = () => {
      setActiveId(activeSectionId(ids));
    };

    let raf = 0;

    const onScroll = () => {
      if (suppressedRef.current) {
        suppress(suppressedRef, settleTimer);

        return;
      }

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);

      if (settleTimer.current !== null) {
        clearTimeout(settleTimer.current);
        settleTimer.current = null;
      }

      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  useEffect(() => {
    if (activeId === null || activeId === "") {
      return;
    }

    const fragment = `#${activeId}`;

    if (window.location.hash !== fragment) {
      window.history.replaceState(null, "", fragment);
    }
  }, [activeId]);

  const scrollTo = (id: string) => {
    const el = document.querySelector(`#${id}`);

    if (!el) {
      return;
    }

    setActiveId(id);
    suppressUntilSettled();
    el.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return { activeId, scrollTo };
};
