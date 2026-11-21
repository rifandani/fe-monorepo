import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { HttpError } from "@workspace/core/http/http";
import type { Schema } from "effect";
import type { Except } from "type-fest";

import { userDetailQueryOptions } from "@/features/user/queries";
import type { userKeys } from "@/features/user/queries";
import type {
  GetUserApiRequestSchema,
  GetUserApiResponseSchema,
} from "@/features/user/schemas";
import { appRuntime } from "@/lib/layers/runtime";

export const useGetUser = (
  params?: GetUserApiRequestSchema,
  options?: Except<
    UseQueryOptions<
      GetUserApiResponseSchema,
      HttpError | Schema.SchemaError,
      GetUserApiResponseSchema,
      ReturnType<typeof userKeys.detail>
    >,
    "queryKey" | "queryFn"
  >
) =>
  useQuery({
    ...userDetailQueryOptions(appRuntime, params),
    ...options,
  });
