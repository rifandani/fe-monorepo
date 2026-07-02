export const ipAddressHeaders = {
  cfConnectingIp: "cf-connecting-ip",
  forwarded: "forwarded",
  xClientIp: "x-client-ip",
  xForwardedFor: "x-forwarded-for",
  xRealIp: "x-real-ip",
} as const;
const forwardedRegex = /for=(?<ip>[^;,\s]+)/u;
/**
 * Get the client IP address from the request headers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded
 *
 * @param headers - The headers object.
 * @returns The client IP address or `null` if not found.
 */
export const getClientIpAddress = (headers: Headers): string | null => {
  // 1. Cloudflare
  const cfConnectingIp = headers.get(ipAddressHeaders.cfConnectingIp);
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  // 2. X-Forwarded-For (most common)
  const xForwardedFor = headers.get(ipAddressHeaders.xForwardedFor);
  if (xForwardedFor) {
    const [firstIp] = xForwardedFor.split(",");
    return firstIp ? firstIp.trim() : null;
  }
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
    if (match?.groups?.ip) {
      return match.groups.ip;
    }
  }
  // 6. Fallback to null
  return null;
};
