import type { NextRequest } from "next/server";

import { SERVICE_NAME } from "@/core/constants/global";
import { createError } from "@/core/utils/evlog";

import { getAllowedHosts, isAllowedOrigin, parseIngestBody } from "./ingest";

export const POST = async (request: NextRequest) => {
  const origin = request.headers.get("origin");
  if (origin && !isAllowedOrigin(request, origin)) {
    const originHost = new URL(origin).host;
    throw createError({
      fix: "Set NEXT_PUBLIC_APP_URL to your dev URL (e.g. https://web.fe-monorepo.localhost with portless)",
      message: "Invalid origin",
      status: 403,
      why: `Origin ${originHost} is not allowed (allowed: ${[...getAllowedHosts(request)].join(", ")})`,
    });
  }
  const body = parseIngestBody(await request.json());
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
