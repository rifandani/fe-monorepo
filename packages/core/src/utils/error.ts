import { HttpResponseError } from "@workspace/core/http/http-response-error";
import { errorResponseSchema } from "@workspace/core/http/schemas";
import { Predicate, Schema } from "effect";

const isErrorResponse = Schema.is(errorResponseSchema);

const isTextBody = Schema.is(Schema.NonEmptyString);

export const genericErrorMessage = "Something went wrong. Please try again.";

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof HttpResponseError) {
    if (isErrorResponse(error.data)) {
      return error.data.message;
    }

    if (isTextBody(error.data)) {
      return error.data;
    }

    return error.message;
  }

  if (Predicate.isTagged(error, "SchemaError")) {
    return genericErrorMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return genericErrorMessage;
};
