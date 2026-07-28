import type { NextRequest } from "next/server";

import { ENV } from "@/core/constants/env";
import { createError } from "@/core/utils/evlog";

const VALID_LEVELS = ["info", "error", "warn", "debug"] as const;

export const getAllowedHosts = (request: NextRequest): Set<string> => {
  const hosts = new Set<string>();
  for (const header of ["host", "x-forwarded-host"] as const) {
    const value = request.headers.get(header);
    if (!value) {
      continue;
    }
    for (const part of value.split(",")) {
      hosts.add(part.trim());
    }
  }
  hosts.add(new URL(ENV.NEXT_PUBLIC_APP_URL).host);
  return hosts;
};

export const isAllowedOrigin = (
  request: NextRequest,
  origin: string
): boolean => {
  const originHost = new URL(origin).host;
  if (getAllowedHosts(request).has(originHost)) {
    return true;
  }
  // portless (and similar proxies) serve https://<name>.localhost while Next sees localhost:<port>
  if (
    process.env.NODE_ENV === "development" &&
    originHost.endsWith(".localhost")
  ) {
    return true;
  }
  return false;
};

export const parseIngestBody = (body: unknown) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError({
      fix: "Please provide a valid request body",
      message: "Invalid request body",
      status: 400,
      why: "Request body is not a valid object",
    });
  }
  const payload = body as Record<string, unknown>;
  if (!payload.timestamp) {
    throw createError({
      fix: "Please provide a timestamp",
      message: "Missing timestamp",
      status: 400,
      why: "Timestamp is required",
    });
  }
  if (
    !payload.level ||
    !VALID_LEVELS.includes(payload.level as (typeof VALID_LEVELS)[number])
  ) {
    throw createError({
      fix: `Please provide a valid level: ${VALID_LEVELS.join(", ")}`,
      message: "Invalid level",
      status: 400,
      why: `Level is required and must be one of the following: ${VALID_LEVELS.join(", ")}`,
    });
  }
  return payload;
};
