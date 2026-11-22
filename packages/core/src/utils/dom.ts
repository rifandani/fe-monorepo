import type { URLSearchParamsInit } from "@workspace/core/types/core";

export const isBrowser = () => "window" in globalThis;

export const canWriteToClipboard = () =>
  isBrowser() && navigator.clipboard?.writeText !== undefined;

const isParamsRecord = (
  init: URLSearchParamsInit
): init is Record<string, string | string[]> =>
  typeof init === "object" &&
  !Array.isArray(init) &&
  !(init instanceof URLSearchParams);

export const createSearchParams = (
  init: URLSearchParamsInit = ""
): URLSearchParams =>
  new URLSearchParams(
    isParamsRecord(init)
      ? Object.entries(init).flatMap(([key, value]): [string, string][] =>
          Array.isArray(value) ? value.map((v) => [key, v]) : [[key, value]]
        )
      : init
  );

export const createSearchParamsWithComma = (init?: URLSearchParamsInit) => {
  const searchParams =
    init === undefined ? new URLSearchParams() : createSearchParams(init);

  for (const [key, value] of Object.entries(init ?? {})) {
    if (Array.isArray(value)) {
      searchParams.delete(key);
      searchParams.set(key, value.join(","));
    }
  }

  return searchParams;
};

interface ExperimentalNavigator extends Navigator {
  userAgentData?: {
    brands: {
      brand: string;
      version: string;
    }[];
    mobile: boolean;
    platform: string;
    getHighEntropyValues: (hints: string[]) => Promise<{
      platform: string;
      platformVersion: string;
      uaFullVersion: string;
    }>;
  };
}

export const getPlatform = (): string => {
  const nav: ExperimentalNavigator = navigator;
  const platform = nav.userAgentData?.platform;

  if (platform !== undefined && platform !== "") {
    return platform;
  }

  return navigator.platform || "";
};

const readHighEntropyPlatform = async (
  userAgentData: NonNullable<ExperimentalNavigator["userAgentData"]>
): Promise<string> => {
  try {
    const values = await userAgentData.getHighEntropyValues(["platform"]);

    return values.platform ?? "";
  } catch {
    return "";
  }
};

export const getPlatformAsync = async (): Promise<string> => {
  const nav: ExperimentalNavigator = navigator;
  const platform = nav.userAgentData?.platform;

  if (platform !== undefined && platform !== "") {
    return platform;
  }

  const highEntropyPlatform = nav.userAgentData
    ? await readHighEntropyPlatform(nav.userAgentData)
    : "";

  if (highEntropyPlatform !== "") {
    return highEntropyPlatform;
  }

  return navigator.platform || "";
};

export const isMacOS = (): boolean =>
  getPlatform().toLowerCase().includes("mac");

export const getShortcutKey = (key: string): string => {
  if (key.toLowerCase() === "mod") {
    return isMacOS() ? "⌘" : "Ctrl";
  }

  if (key.toLowerCase() === "alt") {
    return isMacOS() ? "⌥" : "Alt";
  }

  if (key.toLowerCase() === "shift") {
    return isMacOS() ? "⇧" : "Shift";
  }

  return key;
};

export const getShortcutKeys = (keys: string[]): string =>
  keys.map((key) => getShortcutKey(key)).join("+");

export const saveFile = (data: Blob | MediaSource, fileName: string): void => {
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};
