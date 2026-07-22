import type { NextRequest } from "next/server";

import { ENV } from "@/core/constants/env";
import { SERVICE_NAME } from "@/core/constants/global";
import { createError } from "@/core/utils/evlog";

const VALID_LEVELS = ["info", "error", "warn", "debug"] as const;
const getAllowedHosts = (request: NextRequest): Set<string> => {
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
const isAllowedOrigin = (request: NextRequest, origin: string): boolean => {
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
export const POST = async (request: NextRequest) => {
  const origin = request.headers.get("origin");
  if (origin && !isAllowedOrigin(request, origin)) {
    const originHost = new URL(origin).host;
    throw createError({
      fix: "Set NEXT_PUBLIC_APP_URL to your dev URL (e.g. https://web.localhost with portless)",
      message: "Invalid origin",
      status: 403,
      why: `Origin ${originHost} is not allowed (allowed: ${[...getAllowedHosts(request)].join(", ")})`,
    });
  }
  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw createError({
      fix: "Please provide a valid request body",
      message: "Invalid request body",
      status: 400,
      why: "Request body is not a valid object",
    });
  }
  if (!body.timestamp) {
    throw createError({
      fix: "Please provide a timestamp",
      message: "Missing timestamp",
      status: 400,
      why: "Timestamp is required",
    });
  }
  if (!body.level || !VALID_LEVELS.includes(body.level)) {
    throw createError({
      fix: `Please provide a valid level: ${VALID_LEVELS.join(", ")}`,
      message: "Invalid level",
      status: 400,
      why: `Level is required and must be one of the following: ${VALID_LEVELS.join(", ")}`,
    });
  }
  // oxlint-disable-next-line sonarjs/no-unused-vars -- omit client-provided service field
  const { service: _clientService, ...sanitizedPayload } = body;
  const wideEvent = {
    ...sanitizedPayload,
    environment: process.env.NODE_ENV || "development",
    service: SERVICE_NAME,
    source: "client",
  };
  console.log("[CLIENT_LOG]", wideEvent);
  return new Response(null, { status: 204 });
};
