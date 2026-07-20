/* oxlint-disable sonarjs/no-duplicate-string react-doctor/server-auth-actions -- login/register/logout are intentionally public or session-clearing */
"use server";
import { metrics, trace } from "@opentelemetry/api";
import {
  createServerValidate,
  ServerValidateError,
} from "@tanstack/react-form-nextjs";
import {
  authSignInEmailRequestSchema,
  authSignUpEmailRequestSchema,
} from "@workspace/core/apis/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { tryit } from "radashi";

import { loginFormOpts } from "@/auth/forms/login-form-options";
import { registerFormOpts } from "@/auth/forms/register-form-options";
import { auth } from "@/auth/utils/auth";
import { serverErrorMapper } from "@/core/utils/error";
import { serverFormError } from "@/core/utils/server-form-error";
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

const validateLogin = createServerValidate({
  ...loginFormOpts,
  onServerValidate: authSignInEmailRequestSchema,
});

const validateRegister = createServerValidate({
  ...registerFormOpts,
  onServerValidate: authSignUpEmailRequestSchema,
});

/**
 * Server action to handle user login.
 *
 * @description
 * 1. Validate FormData via TanStack `createServerValidate`
 * 2. Save session to database / set HTTP-only auth cookie
 * 3. Redirect user to home page
 */
export const loginAction = async (_prev: unknown, formData: FormData) => {
  let validated: Awaited<ReturnType<typeof validateLogin>>;
  try {
    validated = await validateLogin(formData);
  } catch (error) {
    if (error instanceof ServerValidateError) {
      return error.formState;
    }
    throw error;
  }

  const domainError = await recordSpan({
    attributes: validated,
    fn: async (span) => {
      loginCounter.add(1);
      const [error, response] = await tryit(auth.api.signInEmail)({
        body: {
          callbackURL: "/",
          email: validated.email,
          password: validated.password,
        },
        headers: await headers(),
      });
      if (error) {
        return serverErrorMapper(error, span);
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
  if (domainError) {
    return serverFormError(validated, domainError);
  }
  redirect("/");
};

/**
 * Server action to handle user register.
 *
 * @description
 * 1. Validate FormData via TanStack `createServerValidate`
 * 2. Save session to database / set HTTP-only auth cookie
 * 3. Redirect user to home page
 */
export const registerAction = async (_prev: unknown, formData: FormData) => {
  let validated: Awaited<ReturnType<typeof validateRegister>>;
  try {
    validated = await validateRegister(formData);
  } catch (error) {
    if (error instanceof ServerValidateError) {
      return error.formState;
    }
    throw error;
  }

  const domainError = await recordSpan({
    attributes: validated,
    fn: async (span) => {
      registerCounter.add(1);
      const [error, response] = await tryit(auth.api.signUpEmail)({
        body: {
          callbackURL: "/",
          email: validated.email,
          name: validated.name,
          password: validated.password,
        },
        headers: await headers(),
      });
      if (error) {
        return serverErrorMapper(error, span);
      }
      span.addEvent("Register success", {
        "user.email": response.user.email,
        "user.id": response.user.id,
      });
    },
    name: "registerAction",
    tracer: trace.getTracer("auth.action"),
  });
  if (domainError) {
    return serverFormError(validated, domainError);
  }
  redirect("/");
};

/**
 * Server action to handle user logout.
 * 1. Remove session from database
 * 2. Remove authentication cookie
 * 3. Redirect user to the login page
 */
export const logoutAction = async (): Promise<
  { error: string } | undefined
> => {
  const domainError = await recordSpan({
    fn: async (span) => {
      logoutCounter.add(1);
      const [error, response] = await tryit(auth.api.signOut)({
        headers: await headers(),
      });
      if (error) {
        return serverErrorMapper(error, span);
      }
      span.addEvent("Logout success", {
        success: response.success,
      });
    },
    name: "logoutAction",
    tracer: trace.getTracer("auth.action"),
  });
  if (domainError) {
    return { error: domainError };
  }
  redirect("/login");
};
