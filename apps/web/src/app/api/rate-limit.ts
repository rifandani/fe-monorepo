/* oxlint-disable sonarjs/function-name -- Next.js route handler convention */
import type { NextRequest } from "next/server";

import { rateLimit } from "@/core/middlewares/rate-limit/rate-limit";

export const GET = async (req: NextRequest): Promise<Response> => {
  await rateLimit(req);
  return Response.json(
    { message: "OK" },
    {
      headers: { "Content-Type": "application/json" },
      status: 200,
    }
  );
};
