import { MutationObserver, skipToken } from "@tanstack/react-query";
import { server } from "@test/msw";
import {
  cdnFileMutationOptions,
  cdnFileQueryOptions,
  cdnKeys,
  cdnValidKeys,
} from "@workspace/core/cdn/queries";
import { makeTestQueryClient } from "@workspace/core/utils/test-query-client";
import { ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const fileUrl = "https://cdn.example.com/a.png";
const key = cdnValidKeys.getArticleCoverImage;

const makeRuntime = () =>
  // oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests -- the unit under test takes a ManagedRuntime, as the app does
  ManagedRuntime.make(FetchHttpClient.layer);

const serveFile = () => {
  server.use(
    http.get(fileUrl, () =>
      HttpResponse.text("img", { headers: { "content-type": "image/png" } })
    )
  );
};

describe("cdnKeys", () => {
  it("should nest the article cover image key under the article key", () => {
    const queryKey = cdnKeys.getArticleCoverImage("https://cdn/x.png");

    expect(cdnKeys.all).toEqual(["cdn"]);
    expect(cdnKeys.article()).toEqual(["cdn", "article"]);
    expect(queryKey).toEqual(["cdn", "article", "https://cdn/x.png"]);
  });
});

describe("cdnFileQueryOptions", () => {
  it("should skip the query while the URL is missing or empty", () => {
    const runtime = makeRuntime();

    const missing = cdnFileQueryOptions(runtime, { key });
    const empty = cdnFileQueryOptions(runtime, { key, url: "" });

    expect(missing.queryFn).toBe(skipToken);
    expect(empty.queryFn).toBe(skipToken);
  });

  it("should download the file under its key", async () => {
    serveFile();
    const runtime = makeRuntime();
    const options = cdnFileQueryOptions(runtime, { key, url: fileUrl });

    const file = await makeTestQueryClient().query(options);

    expect(options.queryKey).toEqual(["cdn", "article", fileUrl]);
    expect(file.headers["content-type"]).toBe("image/png");
    expect(await file.blob.text()).toBe("img");
    await runtime.dispose();
  });
});

describe("cdnFileMutationOptions", () => {
  it("should download the URL given to mutate", async () => {
    serveFile();
    const runtime = makeRuntime();

    const observer = new MutationObserver(
      makeTestQueryClient(),
      cdnFileMutationOptions(runtime, { key })
    );

    const file = await observer.mutate(fileUrl);

    expect(observer.options.mutationKey).toEqual(["cdn", "article", undefined]);
    expect(await file.blob.text()).toBe("img");
    await runtime.dispose();
  });
});
