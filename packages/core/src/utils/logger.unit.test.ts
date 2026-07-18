import { logger } from "@workspace/core/utils/logger";
import { describe, expect, it, vi } from "vitest";

describe("logger", () => {
  it("forwards debug/log/warn/error to console", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.debug("d", { a: 1 });
    logger.log("i", { a: 2 });
    logger.warn("w", { a: 3 });
    logger.error("e", { a: 4 });

    expect(debug).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
    expect(String(debug.mock.calls[0]?.[0])).toContain("DEBUG");
    expect(String(log.mock.calls[0]?.[0])).toContain("INFO");
    expect(String(warn.mock.calls[0]?.[0])).toContain("WARN");
    expect(String(error.mock.calls[0]?.[0])).toContain("ERROR");
  });
});
