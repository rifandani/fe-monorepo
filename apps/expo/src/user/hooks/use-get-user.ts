// oxlint-disable promise/prefer-await-to-callbacks
import { useToastController } from "@tamagui/toast";
import type { UseQueryOptions } from "@tanstack/react-query";
import { skipToken, useQuery } from "@tanstack/react-query";
import type { HTTPError, TimeoutError } from "ky";
import { useEffect } from "react";
import { match, P } from "ts-pattern";
import type { Except } from "type-fest";
import { z } from "zod";

import type { ToastCustomData } from "@/core/providers/toast/the-toast";
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
    const message = match(query.error)
      .with(P.instanceOf(z.ZodError), (err) => z.prettifyError(err))
      .otherwise((err) => err.message);
    toast.show(message, {
      customData: {
        preset: "error",
      } as ToastCustomData,
    });
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error]);
  return query;
};
