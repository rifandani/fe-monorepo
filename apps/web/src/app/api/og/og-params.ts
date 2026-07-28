import type { NextRequest } from "next/server";

/**
 * Keys of the logo lookup table in `route.tsx`, flattened so the brand/scheme
 * decision is a plain string computation with no JSX in scope. `none` is the
 * null-object entry for an unknown brand, so the renderer never null-checks.
 */
export type OgLogoKey =
  | "next-dark"
  | "next-light"
  | "react-dark"
  | "react-light"
  | "none";

const OG_LOGO_KEYS = new Set<string>([
  "next-dark",
  "next-light",
  "react-dark",
  "react-light",
]);

export const parseOgRequest = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  return {
    isLight: req.headers.get("Sec-CH-Prefers-Color-Scheme") === "light",
    title: searchParams.has("title")
      ? searchParams.get("title")
      : "@workspace/web",
    logo: searchParams.has("logo") ? searchParams.get("logo") : "next",
  };
};

/**
 * Resolve the `logo` query value and the requested color scheme into a key of
 * the logo table, falling back to `none` when the brand is unknown.
 */
export const resolveOgLogoKey = (
  logo: string | null,
  isLight: boolean
): OgLogoKey => {
  const key = `${logo}-${isLight ? "light" : "dark"}`;
  return OG_LOGO_KEYS.has(key) ? (key as OgLogoKey) : "none";
};

/**
 * Re-throw anything that is not an `Error` so framework control-flow signals
 * (redirects, `notFound()`) are not swallowed by an image-generation catch.
 */
export const rethrowNonError = (error: unknown): void => {
  if (!(error instanceof Error)) {
    throw error;
  }
};
