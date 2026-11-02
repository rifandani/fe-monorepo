// oxlint-disable promise/prefer-await-to-callbacks
import { useToastController } from "@tamagui/toast";
import type { UseQueryOptions } from "@tanstack/react-query";
import { skipToken, useQuery } from "@tanstack/react-query";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { Effect } from "effect";
import { useEffect } from "react";
import type { Except } from "type-fest";

import { appRuntime } from "@/core/services/runtime";
import type { ToastCustomData } from "@/core/utils/toast";
import { userApi, userKeys } from "@/user/apis/user";

type Params = Parameters<typeof userKeys.detail>[0];

type GetDetailEffect = ReturnType<typeof userApi.getDetail>;

type Success = Effect.Success<GetDetailEffect>;

type QueryError = Effect.Error<GetDetailEffect>;

export const useGetUser = (
  params?: Params,
  options?: Except<
    UseQueryOptions<unknown, QueryError, Success>,
    "queryKey" | "queryFn"
  >
) => {
  const toast = useToastController();

  const query = useQuery({
    // `signal` interrupts the Effect, which aborts the underlying fetch.
    queryFn: params
      ? ({ signal }) =>
          appRuntime.runPromise(userApi.getDetail(params), { signal })
      : skipToken,
    queryKey: userKeys.detail(params),
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
