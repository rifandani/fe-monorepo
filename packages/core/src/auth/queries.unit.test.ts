import { describe, expect, it } from "@effect/vitest";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import {
  authKeys,
  authLoginMutationOptions,
} from "@workspace/core/auth/queries";
import { Http } from "@workspace/core/http/http";
import { currentAccessToken, Session } from "@workspace/core/session/session";
import { Layer, ManagedRuntime, Option } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

const loginResponse = {
  accessToken: "token",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/a.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

/** A runtime like an app's: `Http` plus an in-memory `Session`. */
const makeRuntime = () =>
  ManagedRuntime.make(
    Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
      Layer.provideMerge(Session.layerMemory()),
      Layer.provide(FetchHttpClient.layer)
    )
  );

describe("authKeys", () => {
  it("builds login keys", () => {
    expect(authKeys.all).toEqual(["auth"]);
    expect(authKeys.login()).toEqual(["auth", "login"]);
    expect(authKeys.login({ password: "secret1", username: "ada" })).toEqual([
      "auth",
      "login",
      { password: "secret1", username: "ada" },
    ]);
  });
});

describe("authLoginMutationOptions", () => {
  it("logs in and starts the Session in one mutation", async () => {
    server.use(
      http.post(`${MOCK_API_BASE_URL}/auth/login`, () =>
        HttpResponse.json(loginResponse)
      )
    );
    const runtime = makeRuntime();

    const observer = new MutationObserver(
      new QueryClient(),
      authLoginMutationOptions(runtime)
    );

    const user = await observer.mutate({
      password: "secret1",
      username: "ada",
    });

    const token = await runtime.runPromise(currentAccessToken);

    expect(observer.options.mutationKey).toEqual(["auth", "login"]);
    expect(user.username).toBe("ada");
    expect(token).toEqual(Option.some("token"));
    await runtime.dispose();
  });

  it("starts no Session when the login fails", async () => {
    server.use(
      http.post(`${MOCK_API_BASE_URL}/auth/login`, () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 400 })
      )
    );
    const runtime = makeRuntime();

    const observer = new MutationObserver(
      new QueryClient(),
      authLoginMutationOptions(runtime)
    );

    await expect(
      observer.mutate({ password: "secret1", username: "ada" })
    ).rejects.toMatchObject({ _tag: "HttpResponseError", status: 400 });
    expect(Option.isNone(await runtime.runPromise(currentAccessToken))).toBe(
      true
    );
    await runtime.dispose();
  });
});
