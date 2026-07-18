import { describe, expect, it } from "vitest";

import { getClientIpAddress, ipAddressHeaders } from "./net";

describe("ipAddressHeaders", () => {
  it("exposes canonical header names", () => {
    expect(ipAddressHeaders).toEqual({
      cfConnectingIp: "cf-connecting-ip",
      forwarded: "forwarded",
      xClientIp: "x-client-ip",
      xForwardedFor: "x-forwarded-for",
      xRealIp: "x-real-ip",
    });
  });
});

describe("getClientIpAddress", () => {
  it("prefers Cloudflare connecting IP", () => {
    const headers = new Headers({
      "cf-connecting-ip": "1.1.1.1",
      "x-forwarded-for": "2.2.2.2",
    });
    expect(getClientIpAddress(headers)).toBe("1.1.1.1");
  });

  it("uses first x-forwarded-for hop", () => {
    const headers = new Headers({
      "x-forwarded-for": "3.3.3.3, 4.4.4.4",
    });
    expect(getClientIpAddress(headers)).toBe("3.3.3.3");
  });

  it("falls through x-real-ip, x-client-ip, then forwarded", () => {
    expect(getClientIpAddress(new Headers({ "x-real-ip": "5.5.5.5" }))).toBe(
      "5.5.5.5"
    );
    expect(getClientIpAddress(new Headers({ "x-client-ip": "6.6.6.6" }))).toBe(
      "6.6.6.6"
    );
    expect(
      getClientIpAddress(new Headers({ forwarded: "for=7.7.7.7;proto=https" }))
    ).toBe("7.7.7.7");
  });

  it("returns null when no IP headers are present", () => {
    expect(getClientIpAddress(new Headers())).toBeNull();
  });
});
