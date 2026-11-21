import { afterEach, describe, expect, it, vi } from "vitest";

import { isOffline, resolveSwPrompt } from "./sw";

describe("isOffline", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be false when the navigator does not report onLine", () => {
    vi.stubGlobal("navigator", {});

    const offline = isOffline();

    expect(offline).toBe(false);
  });

  it("should be false when navigator.onLine is true", () => {
    vi.stubGlobal("navigator", { onLine: true });

    const offline = isOffline();

    expect(offline).toBe(false);
  });

  it("should be true when navigator.onLine is false", () => {
    vi.stubGlobal("navigator", { onLine: false });

    const offline = isOffline();

    expect(offline).toBe(true);
  });
});

describe("resolveSwPrompt", () => {
  it("should show nothing while neither flag is set", () => {
    const prompt = resolveSwPrompt({ needRefresh: false, offlineReady: false });

    expect(prompt).toBeNull();
  });

  it("should announce offline readiness without a reload action", () => {
    const prompt = resolveSwPrompt({ needRefresh: false, offlineReady: true });

    expect(prompt).toEqual({ canReload: false, messageKey: "appReady" });
  });

  it("should offer a reload when new content is waiting", () => {
    const prompt = resolveSwPrompt({ needRefresh: true, offlineReady: false });

    expect(prompt).toEqual({
      canReload: true,
      messageKey: "newContentAvailable",
    });
  });

  it("should keep the offline-ready message but still offer the reload", () => {
    const prompt = resolveSwPrompt({ needRefresh: true, offlineReady: true });

    expect(prompt).toEqual({ canReload: true, messageKey: "appReady" });
  });
});
