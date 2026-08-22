/**
 * Security utility functions for development.
 *
 * This file provides:
 * - Bot detection (using User-Agent heuristics)
 * - Attack protection (basic input sanitization)
 *
 * Customize each function based on your needs.
 */
const botPatterns = [
  /bot/iu,
  /crawl/iu,
  /slurp/iu,
  /spider/iu,
  /mediapartners/iu,
];
const reg = /[&<>"'/`]/gu;
export const isBot = (userAgent: string): boolean =>
  botPatterns.some((pattern) => pattern.test(userAgent));
export const sanitizeInput = (input: string): string => {
  // If running in a browser, use a temporary DOM element to safely escape input.
  if ("document" in globalThis) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  }
  // Fallback for non-browser environments:
  const map = {
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "<": "&lt;",
    ">": "&gt;",
    "`": "&#x60;",
  } satisfies Record<string, string>;
  return input.replace(
    reg,
    // SAFETY: `reg` matches exactly the characters keyed in `map`.
    (match) => map[match as keyof typeof map]
  );
};
