export const ipAddressHeaders = {
  cfConnectingIp: "cf-connecting-ip",
  forwarded: "forwarded",
  xClientIp: "x-client-ip",
  xForwardedFor: "x-forwarded-for",
  xRealIp: "x-real-ip",
} as const;
const forwardedRegex = /for=(?<ip>[^;,\s]+)/u;

export const getClientIpAddress = (headers: Headers): string | null => {
  // 1. Cloudflare
  const cfConnectingIp = headers.get(ipAddressHeaders.cfConnectingIp);
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  // 2. X-Forwarded-For (most common)
  const xForwardedFor = headers.get(ipAddressHeaders.xForwardedFor);
  if (xForwardedFor) {
    // Block form because `disable next-line` and `v8 ignore next` cannot stack — see docs/adr/0003-mutation-testing-is-advisory.md.
    // OptionalChaining only: the MethodExpression mutant here (dropping `.trim()`) is killable and is a real gap.
    // Stryker disable OptionalChaining: split always yields a first element for a non-empty header, so `?.` never short-circuits
    /* v8 ignore next -- @preserve split always yields a first element for a non-empty header */
    return xForwardedFor.split(",")[0]?.trim() ?? null;
  }
  // `restore` must lead a statement — as a trailing comment inside the block above it
  // attaches to the `return` and is never read, silently ignoring `match?.[1]` below.
  // Stryker restore OptionalChaining
  // 3. X-Real-IP (Nginx)
  const xRealIp = headers.get(ipAddressHeaders.xRealIp);
  if (xRealIp) {
    return xRealIp;
  }
  // 4. X-Client-IP (used by some load balancers and proxies)
  const xClientIp = headers.get(ipAddressHeaders.xClientIp);
  if (xClientIp) {
    return xClientIp;
  }
  // 5. Forwarded (RFC 7239 standard)
  const forwarded = headers.get(ipAddressHeaders.forwarded);
  if (forwarded) {
    const match = forwarded.match(forwardedRegex);
    if (match?.[1]) {
      return match[1];
    }
  }
  // 6. Fallback to null
  return null;
};
