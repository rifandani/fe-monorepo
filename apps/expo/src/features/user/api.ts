import { Http } from "@workspace/core/http/http";
import { Effect } from "effect";
import { HttpClientResponse } from "effect/http";

import { getUserApiResponseSchema } from "@/features/user/schemas";
import type { GetUserApiRequestSchema } from "@/features/user/schemas";

export const userApi = {
  getDetail: Effect.fn("userApi.getDetail")(function* ({
    id,
  }: GetUserApiRequestSchema) {
    const http = yield* Http;
    const response = yield* http.get(`users/${id}`);

    return yield* HttpClientResponse.schemaBodyJson(getUserApiResponseSchema)(
      response
    );
  }),
} as const;
