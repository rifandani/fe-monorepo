import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  setDraft6Headers,
  setDraft7Headers,
  setRetryAfterHeader,
} from "./headers";
import { DbStore } from "./store";
import type { ConfigType, GeneralConfigType, RateLimitInfo } from "./types";

// 60 seconds
const RATE_LIMIT_WINDOW_MS = 60_000;
// Limit each IP to 5 requests per 60 seconds (1 req/s average)
const RATE_LIMIT_LIMIT = 5;
export const rateLimiter = <P extends string = string>(
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
  const options = {
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
  // Checking if store is valid
  if (!store?.increment) {
    throw new Error("The store is not correctly implemented!");
  }
  // Call the `init` method on the store, if it exists
  if (typeof store.init === "function") {
    store.init(options);
  }
  return async (request: NextRequest) => {
    const context = new Map<string, unknown>();
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
    // Set the standardized `RateLimit-*` headers on the response object
    if (standardHeaders) {
      if (standardHeaders === "draft-7") {
        setDraft7Headers(request.headers, info, windowMs);
      } else {
        // For true and draft-6
        setDraft6Headers(request.headers, info, windowMs);
      }
    }
    // If we are to skip failed/successfull requests, decrement the
    // counter accordingly once we know the status code of the request
    let decremented = false;
    const decrementKey = async () => {
      if (!decremented) {
        await store.decrement(key);
        decremented = true;
      }
    };
    // If the client has exceeded their rate limit, set the Retry-After header
    // and call the `handler` function.
    if (totalHits > _limit) {
      if (standardHeaders) {
        setRetryAfterHeader(request.headers, info, windowMs);
      }
      return handler({ context, headers: request.headers, options });
    }
    await decrementKey();
  };
};
