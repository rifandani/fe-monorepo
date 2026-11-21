import { fc, test } from "@fast-check/vitest";
import { logger } from "@workspace/core/utils/logger";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ANSI = {
  BLUE: "\u001B[34m",
  GREEN: "\u001B[32m",
  RED: "\u001B[31m",
  WHITE: "\u001B[37m",
  YELLOW: "\u001B[33m",
};

const LEVELS = [
  { method: "debug", sink: "debug", label: "DEBUG", color: ANSI.GREEN },
  { method: "log", sink: "log", label: "INFO", color: ANSI.BLUE },
  { method: "warn", sink: "warn", label: "WARN", color: ANSI.YELLOW },
  { method: "error", sink: "error", label: "ERROR", color: ANSI.RED },
] as const;

const silenceConsole = () => ({
  debug: vi.spyOn(console, "debug").mockImplementation(() => {}),
  log: vi.spyOn(console, "log").mockImplementation(() => {}),
  warn: vi.spyOn(console, "warn").mockImplementation(() => {}),
  error: vi.spyOn(console, "error").mockImplementation(() => {}),
});

describe("logger", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should write each level to its console method with its label", () => {
    const consoles = silenceConsole();

    for (const { method, sink, label } of LEVELS) {
      logger[method]("Signed in", { userId: 1 });

      expect(consoles[sink]).toHaveBeenCalledWith(
        expect.stringContaining(`${label}: `),
        { userId: 1 }
      );
    }
  });

  it("should color each level and keep the message in white", () => {
    const consoles = silenceConsole();

    for (const { method, sink, color } of LEVELS) {
      logger[method]("Signed in");

      expect(consoles[sink]).toHaveBeenCalledWith(
        expect.stringContaining(`${color}[`)
      );
      expect(consoles[sink]).toHaveBeenCalledWith(
        expect.stringContaining(`${ANSI.WHITE}Signed in`)
      );
    }
  });

  it("should prefix the line with a 24h timestamp in milliseconds", () => {
    const consoles = silenceConsole();
    vi.setSystemTime(new Date(2026, 10, 20, 13, 5, 9, 42));

    logger.debug("timed");

    expect(consoles.debug).toHaveBeenCalledWith(
      expect.stringContaining("[13:05:09.042]")
    );
  });

  test.prop([fc.date({ noInvalidDate: true }), fc.string()])(
    "should always format the time as HH:MM:SS.mmm with an hour below 24",
    (now, message) => {
      const consoles = silenceConsole();
      vi.setSystemTime(now);

      logger.log(message);

      expect(consoles.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}\] /u)
      );
    }
  );

  test.prop([fc.string()])(
    "should always keep the message unchanged after the label",
    (message) => {
      const consoles = silenceConsole();

      logger.warn(message);

      expect(consoles.warn).toHaveBeenCalledWith(
        expect.stringContaining(`WARN: ${ANSI.WHITE}${message}`)
      );
    }
  );
});
