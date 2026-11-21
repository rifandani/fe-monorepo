"use client";

import { useMediaQuery } from "@reactuses/core";

const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () =>
  useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`, false);
