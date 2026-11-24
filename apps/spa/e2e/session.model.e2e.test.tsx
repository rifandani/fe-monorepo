import { Http } from "@workspace/core/http/http";
import { sessionActivityAtom } from "@workspace/core/session/session";
import { assertTestCoverage, testPaths } from "@xstate/test";
import type { TestSut } from "@xstate/test";
import { Effect } from "effect";
import { HttpClientRequest } from "effect/http";
import { http, HttpResponse } from "msw";
import { describe, expect, test } from "vitest";
import { cleanup } from "vitest-browser-react/pure";
import { page } from "vitest/browser";
import { createMachine } from "xstate";
import type { EventFrom, SnapshotFrom } from "xstate";

import { persistence } from "@/lib/layers/persistence";
import { appRuntime } from "@/lib/layers/runtime";

import { loginForm } from "./support/login-form";
import { emily, worker } from "./support/network";
import { currentPath, renderRoute } from "./support/render-route";

type RefreshResult = "tokens" | "refused" | "failed";

const sessionUiModel = createMachine({
  id: "sessionUi",
  initial: "signedOut",
  states: {
    signedOut: {
      initial: "form",
      on: {
        LOGIN_VALID: { target: "#sessionUi.signedIn" },
        LOGIN_WRONG: { target: ".wrongCredentials" },
      },
      states: {
        form: {},
        wrongCredentials: {},
      },
    },
    signedIn: {
      initial: "idle",
      on: {
        SIGN_OUT: { target: "#sessionUi.signedOut" },
      },
      states: {
        idle: {
          on: {
            REQUEST_REJECTED: { target: "refreshing" },
          },
        },
        refreshing: {
          on: {
            REFRESH_SUCCEEDS: { target: "idle" },
            REFRESH_FAILS: { target: "idle" },
            REFRESH_REFUSED: { target: "#sessionUi.signedOut" },
          },
        },
      },
    },
  },
});

type ModelSnapshot = SnapshotFrom<typeof sessionUiModel>;

type ModelEvent = EventFrom<typeof sessionUiModel>;

const api = (path: string) => `${import.meta.env.VITE_API_BASE_URL}/${path}`;

const protectedPath = "e2e/protected";

const profileMenuButton = () =>
  page.getByRole("button", { name: /account|akun/iu });

const refreshSpinner = () =>
  page.getByRole("progressbar", {
    name: /refreshing your session|memperbarui sesi/iu,
  });

const rejectedRequest = Effect.gen(function* () {
  const client = yield* Http;

  yield* client.execute(HttpClientRequest.get(protectedPath));
}).pipe(Effect.ignore);

const refreshResponse = (result: RefreshResult, refreshes: number) => {
  if (result === "tokens") {
    return HttpResponse.json({
      accessToken: `e2e-access-${String(refreshes)}`,
      refreshToken: `e2e-refresh-${String(refreshes)}`,
    });
  }

  return HttpResponse.json(
    { message: result },
    { status: result === "refused" ? 401 : 500 }
  );
};

const logInWith = async (password: string) => {
  const { usernameInput, passwordInput, submitButton } = loginForm();

  await usernameInput.fill(emily.username);
  await passwordInput.fill(password);
  await submitButton.click();
};

const createSession = async () => {
  const rejectedTokens = new Set<string>();
  const waitingRefreshes: ((result: RefreshResult) => void)[] = [];
  let refreshes = 0;

  worker.use(
    http.get(api(protectedPath), ({ request }) => {
      const token = request.headers
        .get("Authorization")
        ?.replace("Bearer ", "");

      return token !== undefined && rejectedTokens.has(token)
        ? HttpResponse.json({ message: "Unauthorized" }, { status: 401 })
        : HttpResponse.json({});
    }),
    http.post(api("auth/refresh"), async () => {
      const { promise, resolve } = Promise.withResolvers<RefreshResult>();
      waitingRefreshes.push(resolve);
      const result = await promise;

      refreshes += 1;

      return refreshResponse(result, refreshes);
    })
  );

  const respond = async (result: RefreshResult) => {
    await expect.poll(() => waitingRefreshes.length).toBeGreaterThan(0);
    waitingRefreshes.shift()?.(result);
  };

  const send = async (event: ModelEvent) => {
    switch (event.type) {
      case "LOGIN_VALID": {
        await logInWith(emily.password);
        break;
      }

      case "LOGIN_WRONG": {
        await logInWith(`${emily.password}-wrong`);
        break;
      }

      case "SIGN_OUT": {
        await profileMenuButton().click();
        await page.getByRole("menuitem", { name: /logout|keluar/iu }).click();
        break;
      }

      case "REQUEST_REJECTED": {
        const token = persistence.registry.get(
          persistence.sessionAtom
        )?.accessToken;

        if (token !== undefined) {
          rejectedTokens.add(token);
        }

        appRuntime.runFork(rejectedRequest);
        break;
      }

      case "REFRESH_SUCCEEDS": {
        await respond("tokens");
        break;
      }

      case "REFRESH_FAILS": {
        await respond("failed");
        break;
      }

      case "REFRESH_REFUSED": {
        await respond("refused");
        break;
      }

      default: {
        throw new Error(`Unknown event ${JSON.stringify(event)}`);
      }
    }
  };

  const dispose = async () => {
    for (const release of waitingRefreshes.splice(0)) {
      release("failed");
    }

    await expect
      .poll(() => persistence.registry.get(sessionActivityAtom))
      .toBe("idle");
    await cleanup();
    persistence.registry.set(persistence.sessionAtom, null);
    worker.resetHandlers();
  };

  await renderRoute("/login");

  return { send, dispose };
};

const expectSignedOut = async () => {
  await expect.poll(currentPath).toBe("/login");
  await expect.element(loginForm().usernameInput).toBeVisible();
  expect(persistence.registry.get(persistence.sessionAtom)).toBeNull();
};

const expectSignedIn = async () => {
  await expect.poll(currentPath).toBe("/");
  await expect.element(profileMenuButton()).toBeVisible();
  expect(persistence.registry.get(persistence.sessionAtom)).not.toBeNull();
};

const sessionUiSut: TestSut<ModelSnapshot, ModelEvent> = {
  create: createSession,
};

describe("session through the UI", () => {
  test("the pages follow the Session Model on every edge of its graph", async () => {
    const { coverage } = await testPaths(sessionUiModel, {
      pathGenerator: "edges",
      sut: sessionUiSut,
      states: {
        "signedOut.form": async () => {
          await expectSignedOut();
          await expect
            .element(loginForm().mutationError)
            .not.toBeInTheDocument();
        },
        "signedOut.wrongCredentials": async () => {
          await expectSignedOut();
          await expect.element(loginForm().mutationError).toBeVisible();
        },
        "signedIn.idle": async () => {
          await expectSignedIn();
          await expect.element(refreshSpinner()).not.toBeInTheDocument();
        },
        "signedIn.refreshing": async () => {
          await expectSignedIn();
          await expect.element(refreshSpinner()).toBeVisible();
        },
      },
    });

    assertTestCoverage(coverage, { transitions: 1, stateNodes: 1 });
  });
});
