import { describe, expect, it, vi } from "vitest";

import { logger } from "./logger";

const { mockCreateLogger, mockLoggerInstance } = vi.hoisted(() => {
  const loggerInstance = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  };
  const createLogger = vi.fn(() => loggerInstance);
  return { mockCreateLogger: createLogger, mockLoggerInstance: loggerInstance };
});

vi.mock("react-native-logs", () => ({
  logger: {
    createLogger: mockCreateLogger,
  },
}));

describe("logger", () => {
  it("is created via react-native-logs createLogger", () => {
    expect(mockCreateLogger).toHaveBeenCalledOnce();
    expect(logger).toBe(mockLoggerInstance);
  });

  it("exposes log methods from createLogger", () => {
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");

    expect(mockLoggerInstance.debug).toHaveBeenCalledWith("d");
    expect(mockLoggerInstance.info).toHaveBeenCalledWith("i");
    expect(mockLoggerInstance.warn).toHaveBeenCalledWith("w");
    expect(mockLoggerInstance.error).toHaveBeenCalledWith("e");
  });
});
