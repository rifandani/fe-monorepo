import { describe, expect, it, vi } from "vitest";

import {
  BLURHASH,
  IS_ANDROID,
  IS_EXPO,
  IS_IOS,
  IS_TABLET,
  IS_WEB,
  screenDimension,
  windowDimension,
} from "./global";

const { mockDimensionsGet } = vi.hoisted(() => ({
  mockDimensionsGet: vi.fn((type: "window" | "screen") => {
    const size = { fontScale: 1, height: 844, scale: 3, width: 390 };
    return type === "window" || type === "screen" ? size : size;
  }),
}));

vi.mock("react-native", () => ({
  Dimensions: {
    get: mockDimensionsGet,
  },
  Platform: {
    OS: "ios",
  },
}));

vi.mock("expo-constants", () => ({
  default: {
    executionEnvironment: "storeClient",
  },
  ExecutionEnvironment: {
    Bare: "bare",
    Standalone: "standalone",
    StoreClient: "storeClient",
  },
}));

describe("global constants", () => {
  it("reads window and screen dimensions", () => {
    expect(mockDimensionsGet).toHaveBeenCalledWith("window");
    expect(mockDimensionsGet).toHaveBeenCalledWith("screen");
    expect(windowDimension).toEqual({
      fontScale: 1,
      height: 844,
      scale: 3,
      width: 390,
    });
    expect(screenDimension).toEqual(windowDimension);
  });

  it("derives platform flags from Platform.OS", () => {
    expect(IS_ANDROID).toBe(false);
    expect(IS_IOS).toBe(true);
    expect(IS_WEB).toBe(false);
  });

  it("derives IS_TABLET from window width", () => {
    expect(IS_TABLET).toBe(false);
  });

  it("derives IS_EXPO from Constants.executionEnvironment", () => {
    expect(IS_EXPO).toBe(true);
  });

  it("exports BLURHASH placeholder string", () => {
    expect(BLURHASH.length).toBeGreaterThan(0);
  });
});
