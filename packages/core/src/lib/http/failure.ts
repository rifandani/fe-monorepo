import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { errorResponseSchema } from "@workspace/core/http/schemas";
import type enUS from "@workspace/core/i18n/locales/en-US";
import { Cause, Data, Match, Schema } from "effect";
import { HttpClientError } from "effect/http";

export const failureMessageKeys = [
  "errorGeneric",
  "errorRequestRejected",
  "errorTimeout",
  "errorNetwork",
  "errorUnknownOutcome",
] as const satisfies readonly (keyof typeof enUS)[];

export type FailureMessageKey = (typeof failureMessageKeys)[number];

export type ExpectedFailureKey = Exclude<FailureMessageKey, "errorGeneric">;

export type Failure = Data.TaggedEnum<{
  Expected: {
    readonly key: ExpectedFailureKey;
    readonly serverMessage?: string;
  };
  Defect: { readonly cause: unknown };
}>;

export const Failures = Data.taggedEnum<Failure>();

const isErrorResponse = Schema.is(errorResponseSchema);

const fromResponseError = (error: HttpResponseError): Failure =>
  isErrorResponse(error.data) && error.data.message.length > 0
    ? Failures.Expected({
        key: "errorRequestRejected",
        serverMessage: error.data.message,
      })
    : Failures.Expected({ key: "errorRequestRejected" });

const fromClientError = (error: HttpClientError.HttpClientError): Failure =>
  Match.value(error.reason).pipe(
    Match.tag("TransportError", () =>
      Failures.Expected({ key: "errorNetwork" })
    ),
    Match.orElse(() => Failures.Defect({ cause: error }))
  );

export const toFailure = (cause: unknown): Failure => {
  if (cause instanceof HttpResponseError) {
    return fromResponseError(cause);
  }

  if (Cause.isTimeoutError(cause)) {
    return Failures.Expected({ key: "errorTimeout" });
  }

  if (HttpClientError.isHttpClientError(cause)) {
    return fromClientError(cause);
  }

  return Failures.Defect({ cause });
};

export type TranslateFailure = (key: FailureMessageKey) => string;

export const failureMessage = (
  failure: Failure,
  translate: TranslateFailure
): string =>
  Failures.$match(failure, {
    Expected: ({ key, serverMessage }) => serverMessage ?? translate(key),
    Defect: () => translate("errorGeneric"),
  });

export interface FailurePresenter {
  readonly translate: TranslateFailure;
  readonly showError: (message: string) => void;
  readonly reportDefect: (cause: unknown) => void;
}

export const presentFailure = (
  failure: Failure,
  { translate, showError, reportDefect }: FailurePresenter
): void => {
  showError(failureMessage(failure, translate));

  if (Failures.$is("Defect")(failure)) {
    reportDefect(failure.cause);
  }
};
