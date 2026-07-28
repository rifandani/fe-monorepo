import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  setDraft6Headers,
  setDraft7Headers,
  setRetryAfterHeader,
} from "./headers";
import { DbStore } from "./store";
import type { ConfigType, GeneralConfigType, RateLimitInfo } from "./types";

const RATE_LIMIT_WINDOW_MS = 60_000; // 60 seconds
const RATE_LIMIT_LIMIT = 5; // Limit each IP to 5 requests per 60 seconds (1 req/s average)
/** Fills in the defaults for every option the middleware reads. */
const resolveOptions = <P extends string = string>(
  config: GeneralConfigType<ConfigType<P>>
) => {
  const {
    windowMs = RATE_LIMIT_WINDOW_MS,
    limit = RATE_LIMIT_LIMIT,
    message = "Rate limit exceeded. Please try again later.",
    statusCode = 429,
    standardHeaders = "draft-6",
    requestPropertyName = "rateLimit",
    requestStorePropertyName = "rateLimitStore",
    keyGenerator,
    handler = ({ options, headers }) => {
      const responseMessage = options.message;
      if (typeof responseMessage === "string") {
        return new Response(responseMessage, {
          headers,
          status: options.statusCode,
        });
      }
      return NextResponse.json(responseMessage, {
        headers,
        status: options.statusCode,
      });
    },
    store = new DbStore<P>(),
  } = config;
  return {
    handler,
    keyGenerator,
    limit,
    message,
    requestPropertyName,
    requestStorePropertyName,
    standardHeaders,
    statusCode,
    store,
    windowMs,
  };
};

/** Sets the standardized `RateLimit-*` headers on the request object. */
const applyStandardHeaders = <P extends string = string>(
  request: NextRequest,
  info: RateLimitInfo,
  { standardHeaders, windowMs }: ReturnType<typeof resolveOptions<P>>
) => {
  if (!standardHeaders) {
    return;
  }
  if (standardHeaders === "draft-7") {
    setDraft7Headers(request.headers, info, windowMs);
    return;
  }
  // For true and draft-6
  setDraft6Headers(request.headers, info, windowMs);
};

const createRateLimitMiddleware =
  <P extends string = string>(options: ReturnType<typeof resolveOptions<P>>) =>
  async (request: NextRequest) => {
    const {
      handler,
      keyGenerator,
      limit,
      requestPropertyName,
      requestStorePropertyName,
      standardHeaders,
      store,
      windowMs,
    } = options;
    // oxlint-disable-next-line typescript/no-explicit-any
    const context = new Map<string, any>();
    // Get a unique key for the client
    const key = await keyGenerator({ context, request });
    // Increment the client's hit counter by one.
    const { totalHits, resetTime } = await store.increment(key);
    // Set the data store in the context
    context.set(requestStorePropertyName, {
      getKey: store.get?.bind(store),
      resetKey: store.resetKey.bind(store),
    });
    // Get the limit (max number of hits) for each client.
    const retrieveLimit = typeof limit === "function" ? limit(context) : limit;
    const _limit = await retrieveLimit;
    // Define the rate limit info for the client.
    const info: RateLimitInfo = {
      limit: _limit,
      remaining: Math.max(_limit - totalHits, 0),
      resetTime,
      used: totalHits,
    };
    // Set the "rate limit" information in the context
    context.set(requestPropertyName, info);
    applyStandardHeaders(request, info, options);
    // If the client has exceeded their rate limit, set the Retry-After header
    // and call the `handler` function.
    if (totalHits > _limit) {
      if (standardHeaders) {
        setRetryAfterHeader(request.headers, info, windowMs);
      }
      return handler({ context, headers: request.headers, options });
    }
    // We did not reject the request, so this hit should not count against the client
    await store.decrement(key);
  };

export const rateLimiter = <P extends string = string>(
  config: GeneralConfigType<ConfigType<P>>
) => {
  const options = resolveOptions<P>(config);
  const { store } = options;
  // Checking if store is valid
  if (!store?.increment) {
    throw new Error("The store is not correctly implemented!");
  }
  // Call the `init` method on the store, if it exists
  if (typeof store.init === "function") {
    store.init(options);
  }
  return createRateLimitMiddleware<P>(options);
};
