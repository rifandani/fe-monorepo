import { describe, expect, it, vi } from "vitest";

import { isOffline, resolveSwPrompt } from "./sw";

describe("isOffline", () => {
  it("is false when the navigator does not report onLine at all", () => {
    vi.stubGlobal("navigator", {});
    expect(isOffline()).toBe(false);
  });

  it("follows navigator.onLine when it is present", () => {
    vi.stubGlobal("navigator", { onLine: true });
    expect(isOffline()).toBe(false);

    vi.stubGlobal("navigator", { onLine: false });
    expect(isOffline()).toBe(true);
  });
});

describe("resolveSwPrompt", () => {
  it("shows nothing while neither flag is set", () => {
    expect(
      resolveSwPrompt({ needRefresh: false, offlineReady: false })
    ).toBeNull();
  });

  it("announces offline readiness without a reload action", () => {
    expect(resolveSwPrompt({ needRefresh: false, offlineReady: true })).toEqual(
      {
        canReload: false,
        messageKey: "appReady",
      }
    );
  });

  it("offers a reload when new content is waiting", () => {
    expect(resolveSwPrompt({ needRefresh: true, offlineReady: false })).toEqual(
      {
        canReload: true,
        messageKey: "newContentAvailable",
      }
    );
  });

  it("keeps the offline-ready message but still offers the reload", () => {
    expect(resolveSwPrompt({ needRefresh: true, offlineReady: true })).toEqual({
      canReload: true,
      messageKey: "appReady",
    });
  });
});
