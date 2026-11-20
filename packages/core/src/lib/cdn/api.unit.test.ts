import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { ioPropertyParameters } from "@test/arbitraries";
import { server } from "@test/msw";
import { cdnApi, toCdnFile } from "@workspace/core/cdn/api";
import { Effect } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, vi } from "vitest";

// Helpers

const fileUrl = "https://cdn.example.com/a.png";

const getCdnFile = (url: string) =>
  cdnApi.getCdnFile({ url }).pipe(Effect.provide(FetchHttpClient.layer));

const serveBody = (body: BodyInit | null, init?: ResponseInit) => {
  server.use(http.get(fileUrl, () => new HttpResponse(body, init)));
};

describe("cdnApi.getCdnFile", () => {
  it.effect("should return the blob, the headers and the response", () =>
    Effect.gen(function* () {
      // Arrange
      // No request assertion here: `url` is this method's only input, and the
      // handler matching on it *is* the assertion — a wrong URL means no handler
      // matches, which `onUnhandledRequest: "error"` turns into a failure.
      serveBody("img", { headers: { "content-type": "image/png" } });

      // Act
      const result = yield* getCdnFile(fileUrl);

      // Assert
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
      // Arrange
      serveBody(new Uint8Array([1, 2, 3]));

      // Act
      const result = yield* getCdnFile(fileUrl);

      // Assert
      expect(result.headers["content-type"]).toBeUndefined();
      expect(result.blob.type).toBe("");
      expect(result.blob.size).toBe(3);
    })
  );

  it.effect("should fail on a 500", () =>
    Effect.gen(function* () {
      // Arrange
      serveBody(null, { status: 500 });

      // Act
      const error = yield* Effect.flip(getCdnFile(fileUrl));

      // Assert
      expect(error._tag).toBe("HttpClientError");
      expect(error.response?.status).toBe(500);
    })
  );

  test.prop([fc.uint8Array()], ioPropertyParameters())(
    "should always keep every byte of the body",
    async (bytes) => {
      // Arrange
      serveBody(bytes);

      // Act
      const result = await Effect.runPromise(getCdnFile(fileUrl));

      // Assert
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
    // Act
    const withoutName = toCdnFile();
    const withName = toCdnFile(undefined, "a.png");

    // Assert
    expect(withoutName).toBeNull();
    expect(withName).toBeNull();
  });

  it("should wrap the blob in a named File that keeps its mime type", () => {
    // Arrange
    const blob = new Blob(["img"], { type: "image/png" });

    // Act
    const file = toCdnFile(blob, "a.png");

    // Assert
    expect(file).toBeInstanceOf(File);
    expect(file?.name).toBe("a.png");
    expect(file?.type).toBe("image/png");
  });

  it("should fall back to a placeholder name", () => {
    // Arrange
    const blob = new Blob(["img"]);

    // Act
    const file = toCdnFile(blob);

    // Assert
    expect(file?.name).toBe("unknown-filename");
  });

  test("should stamp the file with the current time", ({ g }) => {
    // Arrange
    const now = g(fc.date, { noInvalidDate: true, min: new Date(0) });
    vi.setSystemTime(now);

    // Act
    const file = toCdnFile(new Blob(["img"]), "a.png");

    // Assert
    expect(file?.lastModified).toBe(now.getTime());
  });

  test.prop([fc.uint8Array(), fc.string({ minLength: 1 })])(
    "should always keep the size and the name",
    (bytes, filename) => {
      // Arrange
      const blob = new Blob([bytes]);

      // Act
      const file = toCdnFile(blob, filename);

      // Assert
      expect(file?.size).toBe(bytes.length);
      expect(file?.name).toBe(filename);
    }
  );
});
