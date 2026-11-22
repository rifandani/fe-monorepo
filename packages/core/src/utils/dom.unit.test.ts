import { fc, test } from "@fast-check/vitest";
import {
  canWriteToClipboard,
  createSearchParams,
  createSearchParamsWithComma,
  getPlatform,
  getPlatformAsync,
  getShortcutKey,
  getShortcutKeys,
  isBrowser,
  isMacOS,
} from "@workspace/core/utils/dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const withoutWindow = <T>(fn: () => T): T => {
  const original = globalThis.window;
  // @ts-expect-error -- intentional delete for node env
  delete globalThis.window;

  try {
    return fn();
  } finally {
    globalThis.window = original;
  }
};

const stubPlatform = (platform: string) => {
  vi.stubGlobal("navigator", { platform });
};

const SPECIAL_KEYS = ["mod", "alt", "shift"];

const plainKeyArb = fc
  .string()
  .filter((key) => !SPECIAL_KEYS.includes(key.toLowerCase()));

const commaFreeStringArb = fc.string().map((text) => text.replaceAll(",", ""));

describe("isBrowser", () => {
  it("should be false when window is undefined", () => {
    const result = withoutWindow(isBrowser);

    expect(result).toBe(false);
  });

  it("should be true when window exists", () => {
    vi.stubGlobal("window", {});

    const result = isBrowser();

    expect(result).toBe(true);
  });
});

describe("canWriteToClipboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be false on the server", () => {
    const result = withoutWindow(canWriteToClipboard);

    expect(result).toBe(false);
  });

  it("should be false when the Clipboard API is missing", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", {});

    const result = canWriteToClipboard();

    expect(result).toBe(false);
  });

  it("should be true when navigator.clipboard.writeText exists", () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { clipboard: { writeText: () => {} } });

    const result = canWriteToClipboard();

    expect(result).toBe(true);
  });
});

describe("createSearchParams", () => {
  it("should add one entry for each item of an array value", () => {
    const init = { sort: ["name", "price"] };

    const params = createSearchParams(init);

    expect(params.getAll("sort")).toEqual(["name", "price"]);
  });

  it("should accept a query string", () => {
    const init = "a=1&b=2";

    const params = createSearchParams(init);

    expect(Object.fromEntries(params)).toEqual({ a: "1", b: "2" });
  });

  test.prop([fc.dictionary(fc.string(), fc.array(fc.string()))])(
    "should keep every value of every array key, in order",
    (init) => {
      const params = createSearchParams(init);

      for (const [key, values] of Object.entries(init)) {
        expect(params.getAll(key)).toEqual(values);
      }
    }
  );
});

describe("createSearchParamsWithComma", () => {
  it("should join array values with commas", () => {
    const init = { sort: "asc", filters: ["model", "category"] };

    const params = createSearchParamsWithComma(init);

    expect(params.toString()).toBe("sort=asc&filters=model%2Ccategory");
  });

  it("should return empty params without init", () => {
    const params = createSearchParamsWithComma();

    expect([...params]).toEqual([]);
  });

  test.prop([fc.dictionary(fc.string(), fc.array(commaFreeStringArb))])(
    "should always send one value for each array key",
    (init) => {
      const params = createSearchParamsWithComma(init);

      for (const [key, values] of Object.entries(init)) {
        expect(params.getAll(key)).toEqual([values.join(",")]);
      }
    }
  );
});

describe("getPlatform", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should prefer userAgentData.platform", () => {
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "macOS" },
      platform: "MacIntel",
    });

    const platform = getPlatform();

    expect(platform).toBe("macOS");
  });

  it("should fall back to navigator.platform", () => {
    stubPlatform("Win32");

    const platform = getPlatform();

    expect(platform).toBe("Win32");
  });

  it("should return an empty string when nothing is available", () => {
    vi.stubGlobal("navigator", {});

    const platform = getPlatform();

    expect(platform).toBe("");
  });
});

describe("getPlatformAsync", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should use the high entropy values", async () => {
    vi.stubGlobal("navigator", {
      userAgentData: { getHighEntropyValues: () => ({ platform: "Linux" }) },
      platform: "Linux x86_64",
    });

    const platform = await getPlatformAsync();

    expect(platform).toBe("Linux");
  });

  it("should not ask for high entropy values when userAgentData.platform is set", async () => {
    const getHighEntropyValues = vi.fn();
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "macOS", getHighEntropyValues },
    });

    const platform = await getPlatformAsync();

    expect(platform).toBe("macOS");
    expect(getHighEntropyValues).not.toHaveBeenCalled();
  });

  it("should fall back to navigator.platform when the entropy platform is empty", async () => {
    vi.stubGlobal("navigator", {
      userAgentData: { getHighEntropyValues: () => ({ platform: "" }) },
      platform: "Win32",
    });

    const platform = await getPlatformAsync();

    expect(platform).toBe("Win32");
  });

  it("should fall back to navigator.platform when getHighEntropyValues rejects", async () => {
    vi.stubGlobal("navigator", {
      userAgentData: {
        getHighEntropyValues: async () =>
          await Promise.reject(new Error("denied")),
      },
      platform: "Win32",
    });

    const platform = await getPlatformAsync();

    expect(platform).toBe("Win32");
  });

  it("should return an empty string when nothing is available", async () => {
    vi.stubGlobal("navigator", {});

    const platform = await getPlatformAsync();

    expect(platform).toBe("");
  });
});

describe("isMacOS", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be true on MacIntel", () => {
    stubPlatform("MacIntel");

    const result = isMacOS();

    expect(result).toBe(true);
  });

  it("should be false on Win32", () => {
    stubPlatform("Win32");

    const result = isMacOS();

    expect(result).toBe(false);
  });

  test.prop([fc.string(), fc.mixedCase(fc.constant("mac")), fc.string()])(
    "should always be true for a platform that names mac in any letter case",
    (before, mac, after) => {
      stubPlatform(`${before}${mac}${after}`);

      const result = isMacOS();

      expect(result).toBe(true);
    }
  );
});

describe("getShortcutKey", () => {
  beforeEach(() => {
    stubPlatform("MacIntel");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should map mod, alt and shift to symbols on macOS", () => {
    const keys = SPECIAL_KEYS.map((key) => getShortcutKey(key));

    expect(keys).toEqual(["⌘", "⌥", "⇧"]);
  });

  it("should map mod, alt and shift to words on other platforms", () => {
    stubPlatform("Win32");

    const keys = SPECIAL_KEYS.map((key) => getShortcutKey(key));

    expect(keys).toEqual(["Ctrl", "Alt", "Shift"]);
  });

  test.prop([fc.mixedCase(fc.constantFrom(...SPECIAL_KEYS))])(
    "should map a modifier whatever its letter case",
    (key) => {
      const symbol = getShortcutKey(key);

      expect(["⌘", "⌥", "⇧"]).toContain(symbol);
    }
  );

  test.prop([plainKeyArb])(
    "should never change a key that is not a modifier",
    (key) => {
      const symbol = getShortcutKey(key);

      expect(symbol).toBe(key);
    }
  );
});

describe("getShortcutKeys", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should join the keys with '+' on macOS", () => {
    stubPlatform("MacIntel");

    const shortcut = getShortcutKeys(["mod", "N"]);

    expect(shortcut).toBe("⌘+N");
  });

  it("should join the keys with '+' on other platforms", () => {
    stubPlatform("Win32");

    const shortcut = getShortcutKeys(["mod", "N"]);

    expect(shortcut).toBe("Ctrl+N");
  });
});
