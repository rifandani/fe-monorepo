import {
  cdnKeys,
  cdnRepositories,
  cdnValidKeys,
} from "@workspace/core/apis/cdn";
import ky from "ky";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ky", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("cdn keys", () => {
  it("exposes valid keys and query key builders", () => {
    expect(cdnValidKeys.getArticleCoverImage).toBe("getArticleCoverImage");
    expect(cdnKeys.all).toEqual(["cdn"]);
    expect(cdnKeys.article()).toEqual(["cdn", "article"]);
    expect(cdnKeys.getArticleCoverImage("https://cdn/x.png")).toEqual([
      "cdn",
      "article",
      "https://cdn/x.png",
    ]);
  });
});

describe("cdnRepositories", () => {
  beforeEach(() => {
    vi.mocked(ky.get).mockReset();
  });

  it("getCdnFile returns blob, headers, and response", async () => {
    const blob = new Blob(["img"]);
    const headers = new Headers({ "content-type": "image/png" });
    vi.mocked(ky.get).mockResolvedValue({
      blob: vi.fn(() => blob),
      headers,
    } as never);

    const result = await cdnRepositories().getCdnFile({
      url: "https://cdn.example.com/a.png",
    });

    expect(ky.get).toHaveBeenCalledWith(
      "https://cdn.example.com/a.png",
      undefined
    );
    expect(result.blob).toBe(blob);
    expect(result.headers["content-type"]).toBe("image/png");
  });
});
