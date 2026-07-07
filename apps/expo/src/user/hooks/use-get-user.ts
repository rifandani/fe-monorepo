/* oxlint-disable eslint/func-style react-doctor/no-event-handler */
import { useToastController } from "@tamagui/toast";
import type { UseQueryOptions } from "@tanstack/react-query";
import { skipToken, useQuery } from "@tanstack/react-query";
import type { HTTPError, TimeoutError } from "ky";
import { useEffect } from "react";
import type { Except } from "type-fest";
import { z } from "zod";

import type { ToastCustomData } from "@/core/providers/toast/the-toast";
import { userApi, userKeys } from "@/user/api/user";

type Params = Parameters<typeof userKeys.detail>[0];
type Success = Awaited<ReturnType<typeof userApi.getDetail>>;
type QueryError = z.ZodError | HTTPError | TimeoutError;
export function useGetUser(
  params?: Params,
  options?: Except<
    UseQueryOptions<unknown, QueryError, Success>,
    "queryKey" | "queryFn"
  >
) {
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
    let { message } = query.error;
    if (query.error instanceof z.ZodError) {
      message = z.prettifyError(query.error);
    }
    toast.show(message, {
      customData: {
        preset: "error",
      } as ToastCustomData,
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error]);
  return query;
}
