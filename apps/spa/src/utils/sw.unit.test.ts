import { afterEach, describe, expect, it, vi } from "vitest";

import { isOffline, resolveSwPrompt } from "./sw";

describe("isOffline", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be false when the navigator does not report onLine", () => {
    // Arrange
    vi.stubGlobal("navigator", {});

    // Act
    const offline = isOffline();

    // Assert
    expect(offline).toBe(false);
  });

  it("should be false when navigator.onLine is true", () => {
    // Arrange
    vi.stubGlobal("navigator", { onLine: true });

    // Act
    const offline = isOffline();

    // Assert
    expect(offline).toBe(false);
  });

  it("should be true when navigator.onLine is false", () => {
    // Arrange
    vi.stubGlobal("navigator", { onLine: false });

    // Act
    const offline = isOffline();

    // Assert
    expect(offline).toBe(true);
  });
});

describe("resolveSwPrompt", () => {
  it("should show nothing while neither flag is set", () => {
    // Act
    const prompt = resolveSwPrompt({ needRefresh: false, offlineReady: false });

    // Assert
    expect(prompt).toBeNull();
  });

  it("should announce offline readiness without a reload action", () => {
    // Act
    const prompt = resolveSwPrompt({ needRefresh: false, offlineReady: true });

    // Assert
    expect(prompt).toEqual({ canReload: false, messageKey: "appReady" });
  });

  it("should offer a reload when new content is waiting", () => {
    // Act
    const prompt = resolveSwPrompt({ needRefresh: true, offlineReady: false });

    // Assert
    expect(prompt).toEqual({
      canReload: true,
      messageKey: "newContentAvailable",
    });
  });

  it("should keep the offline-ready message but still offer the reload", () => {
    // Act
    const prompt = resolveSwPrompt({ needRefresh: true, offlineReady: true });

    // Assert
    expect(prompt).toEqual({ canReload: true, messageKey: "appReady" });
  });
});
