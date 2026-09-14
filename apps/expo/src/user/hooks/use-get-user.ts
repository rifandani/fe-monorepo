// oxlint-disable promise/prefer-await-to-callbacks
import { useToastController } from "@tamagui/toast";
import type { UseQueryOptions } from "@tanstack/react-query";
import { skipToken, useQuery } from "@tanstack/react-query";
import { toErrorMessage } from "@workspace/core/utils/error";
import type { HTTPError, TimeoutError } from "ky";
import { useEffect } from "react";
import type { Except } from "type-fest";
import type { z } from "zod";

import type { ToastCustomData } from "@/core/utils/toast";
import { userApi, userKeys } from "@/user/apis/user";

type Params = Parameters<typeof userKeys.detail>[0];
type Success = Awaited<ReturnType<typeof userApi.getDetail>>;
type QueryError = z.ZodError | HTTPError | TimeoutError;
export const useGetUser = (
  params?: Params,
  options?: Except<
    UseQueryOptions<unknown, QueryError, Success>,
    "queryKey" | "queryFn"
  >
) => {
  const toast = useToastController();
  const enabled = !!params;
  const query = useQuery({
    queryFn: enabled ? () => userApi.getDetail(params) : skipToken,
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
