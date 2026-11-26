import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import {
  Failures,
  failureMessage,
  failureMessageKeys,
  presentFailure,
  toFailure,
} from "@workspace/core/http/failure";
import type { FailureMessageKey } from "@workspace/core/http/failure";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import type { ErrorResponseSchema } from "@workspace/core/http/schemas";
import { initI18n } from "@workspace/core/i18n/init";
import { catalogs, locales } from "@workspace/core/i18n/locale";
import type { Locale } from "@workspace/core/i18n/locale";
import { Cause, Effect, Schema } from "effect";
import { HttpClientError, HttpClientRequest } from "effect/http";

const httpError = (
  data?: ErrorResponseSchema | Record<string, string> | string,
  status = 401
) =>
  new HttpResponseError({
    status,
    method: "POST",
    url: "https://api.test/auth/login",
    data,
    message: `Request failed with status code ${String(status)}: POST https://api.test/auth/login`,
  });

const loginRequest = () =>
  HttpClientRequest.post("https://api.test/auth/login");

const translateIn = (locale: Locale) => {
  const { t } = initI18n({
    locale,
    fallbackLocale: "en-us",
    translations: catalogs,
  });

  return (key: FailureMessageKey) => t(key);
};

const translateOnlyIn = (locale: Locale) => {
  const { t } = initI18n({
    locale,
    fallbackLocale: [],
    translations: { [locale]: catalogs[locale] },
  });

  return (key: FailureMessageKey) => t(key);
};

describe("toFailure", () => {
  it("should be an expected refusal with the server message when the body is an Error Envelope", () => {
    const error = httpError({ message: "Invalid credentials" });

    const failure = toFailure(error);

    expect(failure).toEqual(
      Failures.Expected({
        key: "errorRequestRejected",
        serverMessage: "Invalid credentials",
      })
    );
  });

  it("should be an expected refusal with no server message when there is no body", () => {
    const error = httpError();

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Expected({ key: "errorRequestRejected" }));
  });

  it("should not keep a body that is plain text as the server message", () => {
    const error = httpError("<html>Bad Gateway</html>", 502);

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Expected({ key: "errorRequestRejected" }));
  });

  it("should be an expected timeout when the server did not answer in time", () => {
    const error = new Cause.TimeoutError();

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Expected({ key: "errorTimeout" }));
  });

  it("should be an expected network failure when the request did not reach the server", () => {
    const error = new HttpClientError.HttpClientError({
      reason: new HttpClientError.TransportError({ request: loginRequest() }),
    });

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Expected({ key: "errorNetwork" }));
  });

  it("should be a defect when the client could not build the request", () => {
    const error = new HttpClientError.HttpClientError({
      reason: new HttpClientError.InvalidUrlError({ request: loginRequest() }),
    });

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Defect({ cause: error }));
  });

  it.effect("should be a defect when the response shape is wrong", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(
        Schema.decodeUnknownEffect(Schema.Struct({ email: Schema.Finite }))({
          email: "nope",
        })
      );

      const failure = toFailure(error);

      expect(failure).toEqual(Failures.Defect({ cause: error }));
    })
  );

  it("should be a defect for any other Error", () => {
    const error = new TypeError("Cannot read properties of undefined");

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Defect({ cause: error }));
  });

  test.prop([fc.anything()])(
    "should always be a defect when the failure is not an Error",
    (cause) => {
      const failure = toFailure(cause);

      expect(failure).toEqual(Failures.Defect({ cause }));
    }
  );

  test.prop([fc.string({ minLength: 1 }), fc.integer({ min: 400, max: 599 })])(
    "should always keep the Error Envelope message of an error status",
    (serverMessage, status) => {
      const error = httpError({ message: serverMessage }, status);

      const failure = toFailure(error);

      expect(failure).toEqual(
        Failures.Expected({ key: "errorRequestRejected", serverMessage })
      );
    }
  );

  it("should not keep an empty Error Envelope message", () => {
    const error = httpError({ message: "" });

    const failure = toFailure(error);

    expect(failure).toEqual(Failures.Expected({ key: "errorRequestRejected" }));
  });
});

describe("failureMessage", () => {
  it("should show the server message of an expected refusal", () => {
    const failure = Failures.Expected({
      key: "errorRequestRejected",
      serverMessage: "Invalid credentials",
    });

    const message = failureMessage(failure, translateIn("en-us"));

    expect(message).toBe("Invalid credentials");
  });

  it("should translate an expected failure with no server message", () => {
    const failure = Failures.Expected({ key: "errorTimeout" });

    const message = failureMessage(failure, translateIn("id-id"));

    expect(message).toBe(
      "Server tidak merespons tepat waktu. Silakan coba lagi."
    );
  });

  it("should tell the person to check the result after an unknown outcome", () => {
    const failure = Failures.Expected({ key: "errorUnknownOutcome" });

    const message = failureMessage(failure, translateIn("en-us"));

    expect(message).toBe(
      "The server did not answer in time. The action possibly completed. Check the result before you try again."
    );
  });

  it("should show the generic message for a defect", () => {
    const failure = Failures.Defect({ cause: new Error("x is undefined") });

    const message = failureMessage(failure, translateIn("en-us"));

    expect(message).toBe("Something went wrong. Please try again.");
  });

  test.prop([fc.string({ minLength: 1 })])(
    "should never show the message of a defect",
    (detail) => {
      const failure = Failures.Defect({ cause: new Error(detail) });

      const message = failureMessage(failure, translateIn("en-us"));

      expect(message).toBe("Something went wrong. Please try again.");
    }
  );
});

describe("failureMessage of each key", () => {
  for (const locale of locales) {
    for (const key of failureMessageKeys) {
      it(`should have a translation in ${locale} for ${key}`, () => {
        const translate = translateOnlyIn(locale);

        const message = translate(key);

        expect(message).not.toBe(key);
      });
    }
  }
});

describe("presentFailure", () => {
  it("should show an expected failure and not report it", () => {
    const shown: string[] = [];
    const reported: unknown[] = [];
    const failure = Failures.Expected({ key: "errorNetwork" });

    presentFailure(failure, {
      translate: translateIn("en-us"),
      showError: (message) => {
        shown.push(message);
      },
      reportDefect: (cause) => {
        reported.push(cause);
      },
    });

    expect({ shown, reported }).toEqual({
      shown: [
        "Could not connect to the server. Check your connection and try again.",
      ],
      reported: [],
    });
  });

  it("should show the generic message for a defect and report its cause", () => {
    const shown: string[] = [];
    const reported: unknown[] = [];
    const cause = new TypeError("Cannot read properties of undefined");

    presentFailure(Failures.Defect({ cause }), {
      translate: translateIn("en-us"),
      showError: (message) => {
        shown.push(message);
      },
      reportDefect: (reportedCause) => {
        reported.push(reportedCause);
      },
    });

    expect({ shown, reported }).toEqual({
      shown: ["Something went wrong. Please try again."],
      reported: [cause],
    });
  });
});
