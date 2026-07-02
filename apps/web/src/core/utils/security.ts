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
/**
 * Detects if a request might be coming from a bot.
 * This function uses a simple heuristic on the User-Agent string.
 *
 * @param userAgent - User-Agent string from the HTTP request headers.
 * @returns true if a bot is suspected, false otherwise.
 */
export const isBot = (userAgent: string): boolean =>
  botPatterns.some((pattern) => pattern.test(userAgent));
/**
 * Sanitizes input to mitigate common injection attacks.
 * For forms or any user input, this simple implementation escapes
 * common dangerous characters. Further processing or libraries may be needed
 * for advanced scenarios.
 *
 * @param input - The input string.
 * @returns The sanitized string.
 */
export const sanitizeInput = (input: string): string => {
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
};
