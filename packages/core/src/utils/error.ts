import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { errorResponseSchema } from "@workspace/core/http/schemas";
import { Predicate, Schema } from "effect";

const isErrorResponse = Schema.is(errorResponseSchema);

const isTextBody = Schema.is(Schema.NonEmptyString);

export const genericErrorMessage = "Something went wrong. Please try again.";

export const toErrorMessage = (cause: unknown): string => {
  if (cause instanceof HttpResponseError) {
    if (isErrorResponse(cause.data)) {
      return cause.data.message;
    }

    if (isTextBody(cause.data)) {
      return cause.data;
    }

    return cause.message;
  }

  if (Predicate.isTagged(cause, "SchemaError")) {
    return genericErrorMessage;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  return genericErrorMessage;
};
