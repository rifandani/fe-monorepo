import { describe, expect, it, vi } from "vitest";

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
  it("should be the logger that react-native-logs creates", async () => {
    // Act
    const { logger } = await import("./logger");

    // Assert
    expect(mockCreateLogger).toHaveBeenCalledOnce();
    expect(logger).toBe(mockLoggerInstance);
  });

  it("should forward each level to the created logger", async () => {
    // Arrange
    const { logger } = await import("./logger");

    // Act
    logger.debug("Signed in");
    logger.info("Signed in");
    logger.warn("Signed in");
    logger.error("Signed in");

    // Assert
    for (const method of [
      mockLoggerInstance.debug,
      mockLoggerInstance.info,
      mockLoggerInstance.warn,
      mockLoggerInstance.error,
    ]) {
      expect(method).toHaveBeenCalledWith("Signed in");
    }
  });
});
