import { server } from "@test/msw";
import {
  cdnKeys,
  cdnRepositories,
  cdnValidKeys,
} from "@workspace/core/apis/cdn";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const fileUrl = "https://cdn.example.com/a.png";

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
  it("getCdnFile returns blob, headers, and response", async () => {
    server.use(
      http.get(fileUrl, () =>
        HttpResponse.text("img", {
          headers: { "content-type": "image/png" },
        })
      )
    );

    const result = await cdnRepositories().getCdnFile({ url: fileUrl });

    // No request assertion here: `url` is this method's only input, and the handler
    // matching on it *is* the assertion — a wrong URL means no handler matches, which
    // `onUnhandledRequest: "error"` turns into a failure.
    expect(await result.blob.text()).toBe("img");
    expect(result.headers["content-type"]).toBe("image/png");
    expect(result.response.ok).toBe(true);
  });

  it("getCdnFile rejects on a 500", async () => {
    server.use(
      http.get(fileUrl, () => new HttpResponse(null, { status: 500 }))
    );

    // `retry: 0` because ky retries GET twice by default with backoff, which would
    // idle this test ~0.9s waiting to re-receive the same 500.
    await expect(
      cdnRepositories().getCdnFile({ url: fileUrl }, { retry: 0 })
    ).rejects.toThrow();
  });

  it("getCdnFile forwards ky options to the request", async () => {
    let captured: Request | undefined;
    server.use(
      http.get(fileUrl, ({ request }) => {
        captured = request;
        return HttpResponse.text("");
      })
    );

    await cdnRepositories().getCdnFile(
      { url: fileUrl },
      { headers: { "x-trace": "abc" } }
    );

    // Capture-then-assert: the resolver stashes the request and assertions run in the
    // test body, so a failure reports an ordinary `expect` diff instead of the
    // HTTPError that a throwing resolver would surface.
    expect(captured?.headers.get("x-trace")).toBe("abc");
  });
});
