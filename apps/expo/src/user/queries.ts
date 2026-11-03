import { queryOptions, skipToken } from "@tanstack/react-query";
import type { Http, HttpError } from "@workspace/core/http/http";
import type { ResourceListRequestSchema } from "@workspace/core/http/schemas";
import type { ManagedRuntime, Schema } from "effect";

import { userApi } from "@/user/api";
import type {
  GetUserApiRequestSchema,
  GetUserApiResponseSchema,
} from "@/user/schemas";

export const userKeys = {
  all: ["users"] as const,
  detail: (params?: GetUserApiRequestSchema) =>
    [...userKeys.details(), ...(params ? [params] : [])] as const,
  details: () => [...userKeys.all, "detail"] as const,
  list: (params?: ResourceListRequestSchema) =>
    [...userKeys.lists(), ...(params ? [params] : [])] as const,
  lists: () => [...userKeys.all, "list"] as const,
};

/**
 * @description One user's detail. Skipped until `params` is known. The query's
 * `signal` interrupts the Effect, which aborts the underlying fetch.
 */
export const userDetailQueryOptions = (
  runtime: ManagedRuntime.ManagedRuntime<Http, unknown>,
  params?: GetUserApiRequestSchema
) =>
  queryOptions<
    GetUserApiResponseSchema,
    HttpError | Schema.SchemaError,
    GetUserApiResponseSchema,
    ReturnType<typeof userKeys.detail>
  >({
    queryKey: userKeys.detail(params),
    queryFn: params
      ? async ({ signal }) =>
          await runtime.runPromise(userApi.getDetail(params), { signal })
      : skipToken,
  });
