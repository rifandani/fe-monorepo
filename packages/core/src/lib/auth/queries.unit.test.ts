import { fc, test } from "@fast-check/vitest";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { signedInSessionArb, ioPropertyParameters } from "@test/arbitraries";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import {
  authKeys,
  authLoginMutationOptions,
} from "@workspace/core/auth/queries";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { Http } from "@workspace/core/http/http";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { isUnknownOutcome } from "@workspace/core/http/retry-safety";
import { currentAccessToken, Session } from "@workspace/core/session/session";
import { makeTestQueryClient } from "@workspace/core/utils/test-query-client";
import { Layer, ManagedRuntime, Option } from "effect";
import type { Duration } from "effect";
import { FetchHttpClient } from "effect/http";
import { delay, http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const loginUrl = `${MOCK_API_BASE_URL}/auth/login`;

const adaSession: AuthLoginResponseSchema = {
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

const adaCredentials = { password: "secret1", username: "ada" };

const makeRuntime = (timeout?: Duration.Input) =>
  // oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests -- the unit under test takes a ManagedRuntime, as the app does
  ManagedRuntime.make(
    Http.layer({ baseUrl: MOCK_API_BASE_URL, timeout }).pipe(
      Layer.provideMerge(Session.layerMemory()),
      Layer.provide(FetchHttpClient.layer)
    )
  );

const loginObserver = (runtime: ReturnType<typeof makeRuntime>) =>
  new MutationObserver(
    makeTestQueryClient(),
    authLoginMutationOptions(runtime)
  );

const retryingClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: 3, retryDelay: 0 },
    },
  });

describe("authKeys", () => {
  it("should build the login key without and with params", () => {
    const withoutParams = authKeys.login();
    const withParams = authKeys.login(adaCredentials);

    expect(authKeys.all).toEqual(["auth"]);
    expect(withoutParams).toEqual(["auth", "login"]);
    expect(withParams).toEqual(["auth", "login", adaCredentials]);
  });
});

describe("authLoginMutationOptions", () => {
  it("should log in and start the Session in one mutation", async () => {
    server.use(http.post(loginUrl, () => HttpResponse.json(adaSession)));
    const runtime = makeRuntime();
    const observer = loginObserver(runtime);

    const user = await observer.mutate(adaCredentials);

    const token = await runtime.runPromise(currentAccessToken);
    expect(observer.options.mutationKey).toEqual(["auth", "login"]);
    expect(user).toEqual(adaSession);
    expect(token).toEqual(Option.some("token"));
    await runtime.dispose();
  });

  it("should start no Session when the login fails", async () => {
    server.use(
      http.post(loginUrl, () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 400 })
      )
    );
    const runtime = makeRuntime();
    const observer = loginObserver(runtime);

    const mutation = observer.mutate(adaCredentials);

    await expect(mutation).rejects.toBeInstanceOf(HttpResponseError);
    await expect(mutation).rejects.toMatchObject({ status: 400 });
    const token = await runtime.runPromise(currentAccessToken);
    expect(Option.isNone(token)).toBe(true);
    await runtime.dispose();
  });

  it("should send a login only once when the client retries mutations", async () => {
    let attempts = 0;
    server.use(
      http.post(loginUrl, () => {
        attempts += 1;

        return new HttpResponse(null, { status: 503 });
      })
    );
    const runtime = makeRuntime();

    const observer = new MutationObserver(
      retryingClient(),
      authLoginMutationOptions(runtime)
    );

    await observer.mutate(adaCredentials).catch(() => {});

    expect(attempts).toBe(1);
    await runtime.dispose();
  });

  it("should report an unknown outcome when the login times out", async () => {
    server.use(
      http.post(loginUrl, async () => {
        await delay(200);

        return HttpResponse.json(adaSession);
      })
    );
    const runtime = makeRuntime("10 millis");
    const options = authLoginMutationOptions(runtime);
    const observer = new MutationObserver(makeTestQueryClient(), options);

    await observer.mutate(adaCredentials).catch(() => {});

    const { error } = observer.getCurrentResult();
    expect(isUnknownOutcome(error, options.meta)).toBe(true);
    await runtime.dispose();
  });

  test.prop([signedInSessionArb], ioPropertyParameters())(
    "should always start the Session that the server returned",
    async (session) => {
      server.use(http.post(loginUrl, () => HttpResponse.json(session)));
      const runtime = makeRuntime();

      await loginObserver(runtime).mutate(adaCredentials);

      const token = await runtime.runPromise(currentAccessToken);
      expect(token).toEqual(Option.some(session.accessToken));
      await runtime.dispose();
    }
  );

  test.prop(
    [fc.integer({ min: 400, max: 599 }).filter((s) => s !== 407)],
    ioPropertyParameters()
  )("should never start a Session when the login fails", async (status) => {
    server.use(http.post(loginUrl, () => new HttpResponse(null, { status })));
    const runtime = makeRuntime();

    await loginObserver(runtime)
      .mutate(adaCredentials)
      .catch(() => {});

    const token = await runtime.runPromise(currentAccessToken);
    expect(Option.isNone(token)).toBe(true);
    await runtime.dispose();
  });
});
