import { HTTP_STATUS_CODES } from "@workspace/core/constants/http";
import { describe, expect, it } from "vitest";

describe("HTTP_STATUS_CODES", () => {
  it("maps common status codes", () => {
    expect(HTTP_STATUS_CODES.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS_CODES.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS_CODES.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS_CODES.TOO_MANY_REQUESTS).toBe(429);
    expect(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).toBe(500);
  });
});
