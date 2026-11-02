import { describe, expect, it } from "@effect/vitest";
import { server } from "@test/msw";
import {
  cdnKeys,
  cdnRepositories,
  cdnValidKeys,
} from "@workspace/core/apis/cdn";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

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

const getCdnFile = (url: string) =>
  cdnRepositories
    .getCdnFile({ url })
    .pipe(Effect.provide(FetchHttpClient.layer));

describe("cdnRepositories", () => {
  it.effect("getCdnFile returns blob, headers, and response", () =>
    Effect.gen(function* () {
      server.use(
        http.get(fileUrl, () =>
          HttpResponse.text("img", {
            headers: { "content-type": "image/png" },
          })
        )
      );

      const result = yield* getCdnFile(fileUrl);

      // No request assertion here: `url` is this method's only input, and the
      // handler matching on it *is* the assertion — a wrong URL means no handler
      // matches, which `onUnhandledRequest: "error"` turns into a failure.
      expect(yield* Effect.promise(() => result.blob.text())).toBe("img");
      expect(result.blob.type).toBe("image/png");
      expect(result.headers["content-type"]).toBe("image/png");
      expect(result.response.status).toBe(200);
    })
  );

  it.effect(
    "getCdnFile leaves the blob type empty when the CDN names none",
    () =>
      Effect.gen(function* () {
        server.use(
          http.get(fileUrl, () => new HttpResponse(new Uint8Array([1, 2, 3])))
        );

        const result = yield* getCdnFile(fileUrl);

        expect(result.headers["content-type"]).toBeUndefined();
        expect(result.blob.type).toBe("");
        expect(result.blob.size).toBe(3);
      })
  );

  it.effect("getCdnFile fails on a 500", () =>
    Effect.gen(function* () {
      server.use(
        http.get(fileUrl, () => new HttpResponse(null, { status: 500 }))
      );

      const error = yield* Effect.flip(getCdnFile(fileUrl));

      expect(error._tag).toBe("HttpClientError");
      expect(error.response?.status).toBe(500);
    })
  );
});
