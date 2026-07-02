import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { headers } from "next/headers";
import { tryit } from "radashi";
import { z } from "zod";

import { auth } from "@/auth/utils/auth";
import { errorAttributesFromUnknown } from "@/core/utils/error-helper";
import { log } from "@/core/utils/evlog";
import "server-only";

export interface ActionResult<T> {
  data: T | null;
  error: string | null;
}
export const actionResultSchema = z.object({
  data: z.any().nullable(),
  error: z.string().nullable(),
});
/**
 * Default action client with logging middleware
 */
export const actionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string().describe("The name of the action"),
    });
  },
  handleServerError: (error) => {
    log.error({
      area: "action.client",
      caught: errorAttributesFromUnknown(error),
      phase: "handleServerError",
      summary: "Error default server error handler",
    });
    if (error instanceof Error) {
      return error.message;
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
})
  // Define logging middleware
  .use(({ next, metadata }) => {
    const startTime = performance.now();
    return next().then((result) => {
      const endTime = performance.now();
      log.info(
        "action.client",
        `${metadata.actionName} action took ${endTime - startTime}ms`
      );
      return result;
    });
  });
/**
 * Action client based on default `actionClient` with authentication middleware
 *
 * @description
 * 1. Get session from database
 * 2. Validate session
 * 3. Return session in action context
 */
export const authActionClient = actionClient
  // Define authorization middleware
  .use(async ({ next }) => {
    // built-in session validation/parsing
    const [error, session] = await tryit(auth.api.getSession)({
      headers: await headers(),
    });
    if (error) {
      log.error({
        area: "authActionClient",
        caught: errorAttributesFromUnknown(error),
        phase: "getSession",
        summary: "Unauthorized: Error getting session",
      });
      throw new Error(
        "[authActionClient]: Unauthorized: Error getting session"
      );
    }
    if (!session) {
      log.error({
        area: "authActionClient",
        message: "Unauthorized: No session found",
        phase: "getSession",
      });
      throw new Error("[authActionClient]: Unauthorized: No session found");
    }
    log.info("authActionClient", "Authorized: Session is valid");
    // Return the next middleware with `userId` value in the context
    return next({ ctx: session });
  });
