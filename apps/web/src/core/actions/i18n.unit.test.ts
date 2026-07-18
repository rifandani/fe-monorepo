import { beforeEach, describe, expect, it, vi } from "vitest";

import { I18N_COOKIE_NAME, I18N_DEFAULT_LOCALE } from "@/core/constants/i18n";

import { getUserLocaleAction, setUserLocaleAction } from "./i18n";

vi.mock("server-only", () => ({}));

const log = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/core/utils/evlog", () => ({ log }));

vi.mock("@/auth/utils/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

const cookieStore = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => cookieStore),
  headers: vi.fn(() => new Headers()),
}));

describe("i18n actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserLocaleAction", () => {
    it("returns cookie locale when set", async () => {
      cookieStore.get.mockReturnValue({ value: "id" });

      const result = await getUserLocaleAction();

      expect(cookieStore.get).toHaveBeenCalledWith(I18N_COOKIE_NAME);
      expect(result.data).toBe("id");
    });

    it("returns default locale when cookie missing", async () => {
      cookieStore.get.mockReturnValue(null);

      const result = await getUserLocaleAction();

      expect(result.data).toBe(I18N_DEFAULT_LOCALE);
    });
  });

  describe("setUserLocaleAction", () => {
    it("sets the locale cookie", async () => {
      const result = await setUserLocaleAction("id");

      expect(result.validationErrors).toBeUndefined();
      expect(cookieStore.set).toHaveBeenCalledWith(I18N_COOKIE_NAME, "id");
    });

    it("rejects invalid locales", async () => {
      const result = await setUserLocaleAction("fr" as "en");

      expect(result.validationErrors).toBeDefined();
      expect(cookieStore.set).not.toHaveBeenCalled();
    });
  });
});
