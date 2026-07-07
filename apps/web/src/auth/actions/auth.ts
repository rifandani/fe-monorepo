/* oxlint-disable sonarjs/no-duplicate-string */
"use server";
import { metrics, trace } from "@opentelemetry/api";
import {
  authSignInEmailRequestSchema,
  authSignUpEmailRequestSchema,
} from "@workspace/core/apis/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tryit } from "radashi";

import { auth } from "@/auth/utils/auth";
import { actionClient } from "@/core/utils/action";
import { serverErrorMapper } from "@/core/utils/error";
import { recordSpan } from "@/core/utils/telemetry";

const meter = metrics.getMeter("auth.action");
const loginCounter = meter.createCounter("login", {
  description: "How many times the login action is called",
});
const logoutCounter = meter.createCounter("logout", {
  description: "How many times the logout action is called",
});
const registerCounter = meter.createCounter("register", {
  description: "How many times the register action is called",
});
/**
 * Server action to handle user login.
 *
 * @description
 * 1. Save session to database
 * 2. Set an HTTP-only auth cookie
 * 3. Redirect user to home page
 *
 * @returns {Promise<LoginActionResult | void>} Returns error object if login fails (zod error or server error), void if successful (redirects)
 */
export const loginAction = actionClient
  .metadata({ actionName: "login" })
  .inputSchema(authSignInEmailRequestSchema)
  .action(async ({ parsedInput }) => {
    const result = await recordSpan({
      attributes: parsedInput,
      fn: async (span) => {
        loginCounter.add(1);
        // cookie automatically set by plugin nextCookies
        const [error, response] = await tryit(auth.api.signInEmail)({
          body: {
            callbackURL: "/",
            email: parsedInput.email,
            password: parsedInput.password,
          },
          headers: await headers(),
        });
        if (error) {
          return await serverErrorMapper(error, span);
        }
        span.addEvent("Login success", {
          token: response.token,
          "user.email": response.user.email,
          "user.id": response.user.id,
        });
      },
      name: "loginAction",
      tracer: trace.getTracer("auth.action"),
    });
    if (result) {
      return result;
    }
    redirect("/");
  });
/**
 * Server action to handle user register.
 *
 * @description
 * 1. Save session to database
 * 2. Set an HTTP-only auth cookie
 * 3. Redirect user to home page
 */
export const registerAction = actionClient
  .metadata({ actionName: "register" })
  .inputSchema(authSignUpEmailRequestSchema)
  .action(async ({ parsedInput }) => {
    const result = await recordSpan({
      attributes: parsedInput,
      fn: async (span) => {
        registerCounter.add(1);
        // cookie automatically set by plugin nextCookies
        const [error, response] = await tryit(auth.api.signUpEmail)({
          body: {
            callbackURL: "/",
            email: parsedInput.email,
            name: parsedInput.name,
            password: parsedInput.password,
          },
          headers: await headers(),
        });
        if (error) {
          return await serverErrorMapper(error, span);
        }
        span.addEvent("Register success", {
          "user.email": response.user.email,
          "user.id": response.user.id,
        });
      },
      name: "registerAction",
      tracer: trace.getTracer("auth.action"),
    });
    if (result) {
      return result;
    }
    redirect("/");
  });
/**
 * Server action to handle user logout.
 * 1. Remove session from database
 * 2. Remove authentication cookie
 * 3. Redirect user to the login page
 */
export const logoutAction = actionClient
  .metadata({ actionName: "logoutAction" })
  .action(async () => {
    const result = await recordSpan({
      fn: async (span) => {
        logoutCounter.add(1);
        const [error, response] = await tryit(auth.api.signOut)({
          headers: await headers(),
        });
        if (error) {
          return await serverErrorMapper(error, span);
        }
        span.addEvent("Logout success", {
          success: response.success,
        });
      },
      name: "logoutAction",
      tracer: trace.getTracer("auth.action"),
    });
    if (result) {
      return result;
    }
    redirect("/login");
  });
