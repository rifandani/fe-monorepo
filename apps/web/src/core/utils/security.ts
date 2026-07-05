/* oxlint-disable eslint/func-style -- function declarations */
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
export function isBot(userAgent: string): boolean {
  return botPatterns.some((pattern) => pattern.test(userAgent));
}
export function sanitizeInput(input: string): string {
  // If running in a browser, use a temporary DOM element to safely escape input.
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
  }
  // Fallback for non-browser environments:
  const map: Record<string, string> = {
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "<": "&lt;",
    ">": "&gt;",
    "`": "&#x60;",
  };
  return input.replace(reg, (match) => map[match] as string);
}
