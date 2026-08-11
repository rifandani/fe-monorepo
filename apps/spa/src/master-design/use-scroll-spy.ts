import { useEffect, useRef, useState } from "react";

/** Fraction of the viewport height where the "active section" threshold sits. */
const THRESHOLD_RATIO = 0.2;
/** Idle time after the last scroll event before click-suppression is lifted. */
const SETTLE_MS = 150;

interface ScrollSpy {
  activeId: string | null;
  /** Scroll a section into view and pin it active until the smooth scroll settles. */
  scrollTo: (id: string) => void;
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
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setActiveId(ids.at(-1) ?? null);
        return;
      }

      const line = window.innerHeight * THRESHOLD_RATIO;
      let current = ids[0] ?? null;
      for (const id of ids) {
        const el = document.querySelector(`#${id}`);
        if (!el) {
          continue;
        }
        if (el.getBoundingClientRect().top <= line) {
          current = id;
        } else {
          break;
        }
      }
      setActiveId(current);
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
    const hash = `#${activeId}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
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
