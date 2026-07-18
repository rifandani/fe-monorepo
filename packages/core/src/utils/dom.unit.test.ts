import {
  createSearchParams,
  createSearchParamsWithComma,
  doDownload,
  getPlatform,
  getPlatformAsync,
  getShortcutKey,
  getShortcutKeys,
  isBrowser,
  isMacOS,
  saveFile,
} from "@workspace/core/utils/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("isBrowser", () => {
  it("is false when window is undefined", () => {
    const original = globalThis.window;
    // @ts-expect-error -- intentional delete for node env
    delete globalThis.window;
    expect(isBrowser()).toBe(false);
    globalThis.window = original;
  });

  it("is true when window exists", () => {
    vi.stubGlobal("window", {});
    expect(isBrowser()).toBe(true);
  });
});

describe("createSearchParams", () => {
  it("supports array values in object init", () => {
    const params = createSearchParams({ sort: ["name", "price"] });
    expect(params.getAll("sort")).toEqual(["name", "price"]);
  });

  it("accepts string init", () => {
    expect(createSearchParams("a=1&b=2").get("a")).toBe("1");
  });
});

describe("createSearchParamsWithComma", () => {
  it("joins array values with commas", () => {
    const params = createSearchParamsWithComma({
      sort: "asc",
      filters: ["model", "category"],
    });
    expect(params.get("sort")).toBe("asc");
    expect(params.get("filters")).toBe("model,category");
  });
});

describe("platform helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getPlatform prefers userAgentData.platform", () => {
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "macOS" },
      platform: "MacIntel",
    });
    expect(getPlatform()).toBe("macOS");
    expect(isMacOS()).toBe(true);
  });

  it("getPlatform falls back to navigator.platform", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });
    expect(getPlatform()).toBe("Win32");
    expect(isMacOS()).toBe(false);
  });

  it("getPlatformAsync uses high entropy values", async () => {
    vi.stubGlobal("navigator", {
      userAgentData: {
        getHighEntropyValues: vi.fn(() => ({ platform: "Linux" })),
      },
      platform: "Linux x86_64",
    });
    await expect(getPlatformAsync()).resolves.toBe("Linux");
  });
});

describe("shortcut keys", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", { platform: "MacIntel" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps mod/alt/shift on macOS", () => {
    expect(getShortcutKey("mod")).toBe("⌘");
    expect(getShortcutKey("alt")).toBe("⌥");
    expect(getShortcutKey("shift")).toBe("⇧");
    expect(getShortcutKeys(["mod", "N"])).toBe("⌘+N");
  });

  it("maps mod on non-macOS", () => {
    vi.stubGlobal("navigator", { platform: "Win32" });
    expect(getShortcutKey("mod")).toBe("Ctrl");
    expect(getShortcutKeys(["mod", "N"])).toBe("Ctrl+N");
  });
});

describe("doDownload / saveFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("doDownload no-ops on empty url", () => {
    const createElement = vi.fn();
    vi.stubGlobal("document", { createElement, body: { append: vi.fn() } });
    doDownload("");
    expect(createElement).not.toHaveBeenCalled();
  });

  it("doDownload clicks a temporary anchor", () => {
    vi.useFakeTimers();
    const link = {
      href: "",
      download: "",
      target: "",
      click: vi.fn(),
      remove: vi.fn(),
    };
    const append = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => link),
      body: { append },
    });
    doDownload("https://example.com/file.pdf");
    expect(append).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(100);
    expect(link.remove).toHaveBeenCalledOnce();
  });

  it("saveFile creates and revokes an object URL", () => {
    const a = {
      href: "",
      download: "",
      click: vi.fn(),
      remove: vi.fn(),
    };
    const createObjectURL = vi.fn(() => "blob:1");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", { createElement: vi.fn(() => a) });
    vi.stubGlobal("window", {
      URL: { createObjectURL, revokeObjectURL },
    });
    saveFile(new Blob(["x"]), "x.txt");
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(a.download).toBe("x.txt");
    expect(a.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:1");
    expect(a.remove).toHaveBeenCalledOnce();
  });
});
