// oxlint-disable promise/prefer-await-to-callbacks
import { useToastController } from "@tamagui/toast";
import type { UseQueryOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import type { HttpError } from "@workspace/core/http/http";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { Schema } from "effect";
import { useEffect } from "react";
import type { Except } from "type-fest";

import { userDetailQueryOptions } from "@/features/user/queries";
import type { userKeys } from "@/features/user/queries";
import type {
  GetUserApiRequestSchema,
  GetUserApiResponseSchema,
} from "@/features/user/schemas";
import { appRuntime } from "@/lib/layers/runtime";
import type { ToastCustomData } from "@/utils/toast";

/** One user's detail, plus this app's error toast. */
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
) => {
  const toast = useToastController();

  const query = useQuery({
    ...userDetailQueryOptions(appRuntime, params),
    ...options,
  });

  useEffect(() => {
    if (!query.error) {
      return;
    }

    toast.show(toErrorMessage(query.error), {
      customData: {
        preset: "error",
      } satisfies ToastCustomData,
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error]);

  return query;
};
