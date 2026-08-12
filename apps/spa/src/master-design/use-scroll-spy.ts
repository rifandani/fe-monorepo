import { useEffect, useRef, useState } from "react";

/** Fraction of the viewport height where the "active section" threshold sits. */
const THRESHOLD_RATIO = 0.2;
/** Idle time after the last scroll event before click-suppression is lifted. */
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

/** Last section whose top has crossed the viewport threshold, or the last id at page bottom. */
const activeSectionId = (ids: string[]): string | null =>
  isPageBottom()
    ? lastId(ids)
    : idAtThreshold(ids, window.innerHeight * THRESHOLD_RATIO);

interface ScrollSpy {
  activeId: string | null;
  /** Scroll a section into view and pin it active until the smooth scroll settles. */
  scrollTo: (_sectionId: string) => void;
}

/**
 * Highlights the section a reader is looking at while scrolling the window.
 *
 * The active section is the last one whose top has crossed a line ~20% down the
 * viewport, with a bottom-of-page override so short trailing sections can still
 * win. During a click-initiated smooth scroll the spy is suppressed so the
 * highlight jumps straight to the target instead of flickering through every
 * section it passes. The active id is mirrored to the URL hash via
 * `replaceState` (no history spam) and honored on first load for deep links.
 *
 * `ids` is expected to be a stable reference (the module-level registry order).
 */
export const useScrollSpy = (ids: string[]): ScrollSpy => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);
  const suppressedRef = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suppressUntilSettled = () => {
    suppressedRef.current = true;
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
    }
    settleTimer.current = setTimeout(() => {
      suppressedRef.current = false;
    }, SETTLE_MS);
  };

  useEffect(() => {
    if (ids.length === 0) {
      return;
    }

    const compute = () => {
      setActiveId(activeSectionId(ids));
    };

    let raf = 0;
    const onScroll = () => {
      if (suppressedRef.current) {
        // Keep the highlight pinned; just extend the settle window.
        if (settleTimer.current) {
          clearTimeout(settleTimer.current);
        }
        settleTimer.current = setTimeout(() => {
          suppressedRef.current = false;
        }, SETTLE_MS);
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  useEffect(() => {
    if (!activeId) {
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
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { activeId, scrollTo };
};
