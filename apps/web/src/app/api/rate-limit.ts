/* oxlint-disable eslint/func-style sonarjs/function-name -- function declarations; Next.js route handler convention */
import type { NextRequest } from "next/server";

import { rateLimit } from "@/core/middlewares/rate-limit/rate-limit";

export async function GET(req: NextRequest): Promise<Response> {
  await rateLimit(req);
  return Response.json(
    { message: "OK" },
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
}
