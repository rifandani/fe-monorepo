import { mutationOptions } from "@tanstack/react-query";
import { authApi } from "@workspace/core/auth/api";
import type {
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
} from "@workspace/core/auth/schemas";
import type { Http } from "@workspace/core/http/http";
import { startSession } from "@workspace/core/session/session";
import type { Session } from "@workspace/core/session/session";
import { Effect } from "effect";
import type { ManagedRuntime } from "effect";

export const authKeys = {
  all: ["auth"] as const,
  login: (params?: AuthLoginRequestSchema) =>
    [...authKeys.all, "login", ...(params ? [params] : [])] as const,
};

export type AuthLoginError = Effect.Error<ReturnType<typeof authApi.login>>;

export const authLoginMutationOptions = (
  runtime: ManagedRuntime.ManagedRuntime<Http | Session, unknown>
) =>
  mutationOptions<
    AuthLoginResponseSchema,
    AuthLoginError,
    AuthLoginRequestSchema
  >({
    mutationKey: authKeys.login(),
    mutationFn: async (json) =>
      await runtime.runPromise(
        authApi.login(json).pipe(Effect.tap(startSession))
      ),
  });
