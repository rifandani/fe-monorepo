/* oxlint-disable eslint/func-style -- function declarations */
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
