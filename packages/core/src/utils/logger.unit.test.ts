import { logger } from "@workspace/core/utils/logger";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards debug/log/warn/error to console with level labels", () => {
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

  it("colors each severity and keeps the message in white", () => {
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    logger.debug("d");
    logger.log("i");
    logger.warn("w");
    logger.error("e");

    // ANSI pins: empty-string COLOR mutants drop these escapes.
    expect(String(debug.mock.calls[0]?.[0])).toContain("\u001B[32m"); // GREEN
    expect(String(log.mock.calls[0]?.[0])).toContain("\u001B[34m"); // BLUE
    expect(String(warn.mock.calls[0]?.[0])).toContain("\u001B[33m"); // YELLOW
    expect(String(error.mock.calls[0]?.[0])).toContain("\u001B[31m"); // RED
    for (const spy of [debug, log, warn, error]) {
      expect(String(spy.mock.calls[0]?.[0])).toContain("\u001B[37m"); // WHITE
    }
  });

  it("formats the timestamp with 24h clock and milliseconds", () => {
    vi.spyOn(Date.prototype, "toLocaleTimeString").mockImplementation(
      (
        _locales?: Intl.LocalesArgument,
        options?: Intl.DateTimeFormatOptions
      ) => {
        expect(_locales).toBe("en-US");
        expect(options).toEqual({
          fractionalSecondDigits: 3,
          hour: "2-digit",
          hour12: false,
          minute: "2-digit",
          second: "2-digit",
        });
        return "12:00:00.000";
      }
    );
    const debug = vi.spyOn(console, "debug").mockImplementation(() => {});

    logger.debug("timed");

    expect(String(debug.mock.calls[0]?.[0])).toContain("[12:00:00.000]");
  });
});
