"use client";

import { useMediaQuery } from "@reactuses/core";

const MOBILE_BREAKPOINT = 768;

/**
 * Tracks whether the viewport is narrower than the mobile breakpoint.
 *
 * @returns `true` while the viewport is below `MOBILE_BREAKPOINT`, defaulting to
 * `false` before the media query has been evaluated.
 */
export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, false);
