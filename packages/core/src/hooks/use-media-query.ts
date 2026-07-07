/* oxlint-disable eslint/func-style react/react-compiler react-doctor/react-compiler-no-manual-memoization react-doctor/rerender-lazy-state-init */
import { useCallback, useEffect, useState } from "react";

/**
 * Easily retrieve media dimensions with this Hook React which also works onResize.
 *
 * @example
 *
 * ```ts
 * const matches = useMediaQuery('(min-width: 768px)')
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((_query: string): boolean => {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(_query).matches;
    }
    return false;
  }, []);
  const [matches, setMatches] = useState<boolean>(getMatches(query));
  const handleChange = useCallback(() => {
    setMatches(getMatches(query));
  }, [query, getMatches]);
  useEffect(() => {
    const matchMedia = window.matchMedia(query);
    // Triggered at the first client-side load and if query changes
    handleChange();
    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }
    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
  }, [query, handleChange]);
  return matches;
}
