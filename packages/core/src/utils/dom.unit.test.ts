import { fc, test } from "@fast-check/vitest";
import {
  canWriteToClipboard,
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

// Helpers

/** Runs `fn` with no `window` global, as on the server, then puts it back. */
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

/** A key that `getShortcutKey` does not translate. */
const plainKeyArb = fc
  .string()
  .filter((key) => !SPECIAL_KEYS.includes(key.toLowerCase()));

const commaFreeStringArb = fc.string().map((text) => text.replaceAll(",", ""));

const anchorStub = () => ({
  href: "",
  download: "",
  target: "",
  click: vi.fn(),
  remove: vi.fn(),
});

describe("isBrowser", () => {
  it("should be false when window is undefined", () => {
    // Act
    const result = withoutWindow(isBrowser);

    // Assert
    expect(result).toBe(false);
  });

  it("should be true when window exists", () => {
    // Arrange
    vi.stubGlobal("window", {});

    // Act
    const result = isBrowser();

    // Assert
    expect(result).toBe(true);
  });
});

describe("canWriteToClipboard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be false on the server", () => {
    // Act
    const result = withoutWindow(canWriteToClipboard);

    // Assert
    expect(result).toBe(false);
  });

  it("should be false when the Clipboard API is missing", () => {
    // Arrange
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", {});

    // Act
    const result = canWriteToClipboard();

    // Assert
    expect(result).toBe(false);
  });

  it("should be true when navigator.clipboard.writeText exists", () => {
    // Arrange
    vi.stubGlobal("window", {});
    vi.stubGlobal("navigator", { clipboard: { writeText: () => {} } });

    // Act
    const result = canWriteToClipboard();

    // Assert
    expect(result).toBe(true);
  });
});

describe("createSearchParams", () => {
  it("should add one entry for each item of an array value", () => {
    // Arrange
    const init = { sort: ["name", "price"] };

    // Act
    const params = createSearchParams(init);

    // Assert
    expect(params.getAll("sort")).toEqual(["name", "price"]);
  });

  it("should accept a query string", () => {
    // Arrange
    const init = "a=1&b=2";

    // Act
    const params = createSearchParams(init);

    // Assert
    expect(Object.fromEntries(params)).toEqual({ a: "1", b: "2" });
  });

  test.prop([fc.dictionary(fc.string(), fc.array(fc.string()))])(
    "should keep every value of every array key, in order",
    (init) => {
      // Act
      const params = createSearchParams(init);

      // Assert
      for (const [key, values] of Object.entries(init)) {
        expect(params.getAll(key)).toEqual(values);
      }
    }
  );
});

describe("createSearchParamsWithComma", () => {
  it("should join array values with commas", () => {
    // Arrange
    const init = { sort: "asc", filters: ["model", "category"] };

    // Act
    const params = createSearchParamsWithComma(init);

    // Assert
    expect(params.toString()).toBe("sort=asc&filters=model%2Ccategory");
  });

  it("should return empty params without init", () => {
    // Act
    const params = createSearchParamsWithComma();

    // Assert
    expect([...params]).toEqual([]);
  });

  test.prop([fc.dictionary(fc.string(), fc.array(commaFreeStringArb))])(
    "should always send one value for each array key",
    (init) => {
      // Act
      const params = createSearchParamsWithComma(init);

      // Assert
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
    // Arrange
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "macOS" },
      platform: "MacIntel",
    });

    // Act
    const platform = getPlatform();

    // Assert
    expect(platform).toBe("macOS");
  });

  it("should fall back to navigator.platform", () => {
    // Arrange
    stubPlatform("Win32");

    // Act
    const platform = getPlatform();

    // Assert
    expect(platform).toBe("Win32");
  });

  it("should return an empty string when nothing is available", () => {
    // Arrange
    vi.stubGlobal("navigator", {});

    // Act
    const platform = getPlatform();

    // Assert
    expect(platform).toBe("");
  });
});

describe("getPlatformAsync", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should use the high entropy values", async () => {
    // Arrange
    vi.stubGlobal("navigator", {
      userAgentData: { getHighEntropyValues: () => ({ platform: "Linux" }) },
      platform: "Linux x86_64",
    });

    // Act
    const platform = await getPlatformAsync();

    // Assert
    expect(platform).toBe("Linux");
  });

  it("should not ask for high entropy values when userAgentData.platform is set", async () => {
    // Arrange
    const getHighEntropyValues = vi.fn();
    vi.stubGlobal("navigator", {
      userAgentData: { platform: "macOS", getHighEntropyValues },
    });

    // Act
    const platform = await getPlatformAsync();

    // Assert
    expect(platform).toBe("macOS");
    expect(getHighEntropyValues).not.toHaveBeenCalled();
  });

  it("should fall back to navigator.platform when the entropy platform is empty", async () => {
    // Arrange
    vi.stubGlobal("navigator", {
      userAgentData: { getHighEntropyValues: () => ({ platform: "" }) },
      platform: "Win32",
    });

    // Act
    const platform = await getPlatformAsync();

    // Assert
    expect(platform).toBe("Win32");
  });

  it("should fall back to navigator.platform when getHighEntropyValues rejects", async () => {
    // Arrange
    vi.stubGlobal("navigator", {
      userAgentData: {
        getHighEntropyValues: async () =>
          await Promise.reject(new Error("denied")),
      },
      platform: "Win32",
    });

    // Act
    const platform = await getPlatformAsync();

    // Assert
    expect(platform).toBe("Win32");
  });

  it("should return an empty string when nothing is available", async () => {
    // Arrange
    vi.stubGlobal("navigator", {});

    // Act
    const platform = await getPlatformAsync();

    // Assert
    expect(platform).toBe("");
  });
});

describe("isMacOS", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should be true on MacIntel", () => {
    // Arrange
    stubPlatform("MacIntel");

    // Act
    const result = isMacOS();

    // Assert
    expect(result).toBe(true);
  });

  it("should be false on Win32", () => {
    // Arrange
    stubPlatform("Win32");

    // Act
    const result = isMacOS();

    // Assert
    expect(result).toBe(false);
  });

  test.prop([fc.string(), fc.mixedCase(fc.constant("mac")), fc.string()])(
    "should always be true for a platform that names mac in any letter case",
    (before, mac, after) => {
      // Arrange
      stubPlatform(`${before}${mac}${after}`);

      // Act
      const result = isMacOS();

      // Assert
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
    // Act
    const keys = SPECIAL_KEYS.map((key) => getShortcutKey(key));

    // Assert
    expect(keys).toEqual(["⌘", "⌥", "⇧"]);
  });

  it("should map mod, alt and shift to words on other platforms", () => {
    // Arrange
    stubPlatform("Win32");

    // Act
    const keys = SPECIAL_KEYS.map((key) => getShortcutKey(key));

    // Assert
    expect(keys).toEqual(["Ctrl", "Alt", "Shift"]);
  });

  test.prop([fc.mixedCase(fc.constantFrom(...SPECIAL_KEYS))])(
    "should map a modifier whatever its letter case",
    (key) => {
      // Act
      const symbol = getShortcutKey(key);

      // Assert
      expect(["⌘", "⌥", "⇧"]).toContain(symbol);
    }
  );

  test.prop([plainKeyArb])(
    "should never change a key that is not a modifier",
    (key) => {
      // Act
      const symbol = getShortcutKey(key);

      // Assert
      expect(symbol).toBe(key);
    }
  );
});

describe("getShortcutKeys", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should join the keys with '+' on macOS", () => {
    // Arrange
    stubPlatform("MacIntel");

    // Act
    const shortcut = getShortcutKeys(["mod", "N"]);

    // Assert
    expect(shortcut).toBe("⌘+N");
  });

  it("should join the keys with '+' on other platforms", () => {
    // Arrange
    stubPlatform("Win32");

    // Act
    const shortcut = getShortcutKeys(["mod", "N"]);

    // Assert
    expect(shortcut).toBe("Ctrl+N");
  });
});

describe("doDownload", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("should do nothing for an empty url", () => {
    // Arrange
    const createElement = vi.fn();
    vi.stubGlobal("document", { createElement, body: { append: vi.fn() } });

    // Act
    doDownload("");

    // Assert
    expect(createElement).not.toHaveBeenCalled();
  });

  it("should click a temporary anchor and remove it after 100ms", () => {
    // Arrange
    vi.useFakeTimers();
    const link = anchorStub();
    const append = vi.fn();
    vi.stubGlobal("document", {
      createElement: () => link,
      body: { append },
    });

    // Act
    doDownload("https://example.com/file.pdf");
    vi.advanceTimersByTime(100);

    // Assert
    expect(append).toHaveBeenCalledWith(link);
    expect(link.click).toHaveBeenCalledOnce();
    expect(link.remove).toHaveBeenCalledOnce();
  });
});

describe("saveFile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should download the data under the file name and revoke its object URL", () => {
    // Arrange
    const anchor = anchorStub();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", { createElement: () => anchor });
    vi.stubGlobal("window", {
      URL: { createObjectURL: () => "blob:1", revokeObjectURL },
    });

    // Act
    saveFile(new Blob(["x"]), "report.txt");

    // Assert
    expect(anchor.download).toBe("report.txt");
    expect(anchor.click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:1");
    expect(anchor.remove).toHaveBeenCalledOnce();
  });
});
