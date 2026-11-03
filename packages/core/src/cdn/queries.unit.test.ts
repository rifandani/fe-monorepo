import { describe, expect, it } from "@effect/vitest";
import {
  MutationObserver,
  QueryClient,
  skipToken,
} from "@tanstack/react-query";
import { server } from "@test/msw";
import {
  cdnFileMutationOptions,
  cdnFileQueryOptions,
  cdnKeys,
  cdnValidKeys,
} from "@workspace/core/cdn/queries";
import { ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

const fileUrl = "https://cdn.example.com/a.png";
const key = cdnValidKeys.getArticleCoverImage;

const serveFile = () => {
  server.use(
    http.get(fileUrl, () =>
      HttpResponse.text("img", { headers: { "content-type": "image/png" } })
    )
  );
};

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

describe("cdnFileQueryOptions", () => {
  it("skips the query while the URL is empty", () => {
    const runtime = ManagedRuntime.make(FetchHttpClient.layer);

    expect(cdnFileQueryOptions(runtime, { key }).queryFn).toBe(skipToken);
    expect(cdnFileQueryOptions(runtime, { key, url: "" }).queryFn).toBe(
      skipToken
    );
  });

  it("downloads the file under its key", async () => {
    serveFile();
    const runtime = ManagedRuntime.make(FetchHttpClient.layer);
    const options = cdnFileQueryOptions(runtime, { key, url: fileUrl });

    const file = await new QueryClient().query(options);

    expect(options.queryKey).toEqual(["cdn", "article", fileUrl]);
    expect(file.headers["content-type"]).toBe("image/png");
    expect(await file.blob.text()).toBe("img");
    await runtime.dispose();
  });
});

describe("cdnFileMutationOptions", () => {
  it("downloads the URL given to mutate", async () => {
    serveFile();
    const runtime = ManagedRuntime.make(FetchHttpClient.layer);

    const observer = new MutationObserver(
      new QueryClient(),
      cdnFileMutationOptions(runtime, { key })
    );

    const file = await observer.mutate(fileUrl);

    expect(observer.options.mutationKey).toEqual(["cdn", "article", undefined]);
    expect(await file.blob.text()).toBe("img");
    await runtime.dispose();
  });
});
