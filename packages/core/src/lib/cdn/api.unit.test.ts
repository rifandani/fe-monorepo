import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { ioPropertyParameters } from "@test/arbitraries";
import { server } from "@test/msw";
import { cdnApi, toCdnFile } from "@workspace/core/cdn/api";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

const fileUrl = "https://cdn.example.com/a.png";

const getCdnFile = (url: string) =>
  cdnApi.getCdnFile({ url }).pipe(Effect.provide(FetchHttpClient.layer));

const serveBody = (body: BodyInit | null, init?: ResponseInit) => {
  server.use(http.get(fileUrl, () => new HttpResponse(body, init)));
};

describe("cdnApi.getCdnFile", () => {
  it.effect("should return the blob, the headers and the response", () =>
    Effect.gen(function* () {
      serveBody("img", { headers: { "content-type": "image/png" } });

      const result = yield* getCdnFile(fileUrl);

      expect(yield* Effect.promise(async () => await result.blob.text())).toBe(
        "img"
      );
      expect(result.blob.type).toBe("image/png");
      expect(result.headers["content-type"]).toBe("image/png");
      expect(result.response.status).toBe(200);
    })
  );

  it.effect("should leave the blob type empty when the CDN names none", () =>
    Effect.gen(function* () {
      serveBody(new Uint8Array([1, 2, 3]));

      const result = yield* getCdnFile(fileUrl);

      expect(result.headers["content-type"]).toBeUndefined();
      expect(result.blob.type).toBe("");
      expect(result.blob.size).toBe(3);
    })
  );

  it.effect("should fail on a 500", () =>
    Effect.gen(function* () {
      serveBody(null, { status: 500 });

      const error = yield* Effect.flip(getCdnFile(fileUrl));

      expect(error._tag).toBe("HttpClientError");
      expect(error.response?.status).toBe(500);
    })
  );

  test.prop([fc.uint8Array()], ioPropertyParameters())(
    "should always keep every byte of the body",
    async (bytes) => {
      serveBody(bytes);

      const result = await Effect.runPromise(getCdnFile(fileUrl));

      expect(new Uint8Array(await result.blob.arrayBuffer())).toEqual(bytes);
    }
  );
});

describe("toCdnFile", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return null while the blob is undefined", () => {
    const withoutName = toCdnFile();
    const withName = toCdnFile(undefined, "a.png");

    expect(withoutName).toBeNull();
    expect(withName).toBeNull();
  });

  it("should wrap the blob in a named File that keeps its mime type", () => {
    const blob = new Blob(["img"], { type: "image/png" });

    const file = toCdnFile(blob, "a.png");

    expect(file).toBeInstanceOf(File);
    expect(file?.name).toBe("a.png");
    expect(file?.type).toBe("image/png");
  });

  it("should fall back to a placeholder name", () => {
    const blob = new Blob(["img"]);

    const file = toCdnFile(blob);

    expect(file?.name).toBe("unknown-filename");
  });

  test("should stamp the file with the current time", ({ g }) => {
    const now = g(fc.date, { noInvalidDate: true, min: new Date(0) });
    vi.setSystemTime(now);

    const file = toCdnFile(new Blob(["img"]), "a.png");

    expect(file?.lastModified).toBe(now.getTime());
  });

  test.prop([fc.uint8Array(), fc.string({ minLength: 1 })])(
    "should always keep the size and the name",
    (bytes, filename) => {
      const blob = new Blob([bytes]);

      const file = toCdnFile(blob, filename);

      expect(file?.size).toBe(bytes.length);
      expect(file?.name).toBe(filename);
    }
  );
});
