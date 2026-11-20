import { fc, test } from "@fast-check/vitest";
import { HttpResponseError } from "@workspace/core/http/http-response-error";
import type { ErrorResponseSchema } from "@workspace/core/http/schemas";
import {
  genericErrorMessage,
  toErrorMessage,
} from "@workspace/core/utils/error";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

// Helpers

/**
 * Tests build the error directly rather than through MSW: this module neither
 * builds nor decodes a request, so ADR-0002's rule of thumb points at the Module
 * Boundary.
 */
const httpError = (
  data?: ErrorResponseSchema | Record<string, string> | string,
  status = 401
) =>
  new HttpResponseError({
    status,
    method: "GET",
    url: "https://api.test/things",
    data,
    message: `Request failed with status code ${String(status)}: GET https://api.test/things`,
  });

describe("toErrorMessage", () => {
  it("should read the Error Envelope", () => {
    // Arrange
    const error = httpError({ message: "Invalid credentials" });

    // Act
    const message = toErrorMessage(error);

    // Assert
    expect(message).toBe("Invalid credentials");
  });

  it("should read an error body that is plain text", () => {
    // Arrange
    const error = httpError("Service unavailable", 503);

    // Act
    const message = toErrorMessage(error);

    // Assert
    expect(message).toBe("Service unavailable");
  });

  it("should fall back to the error's message when there is no body", () => {
    // Arrange
    const error = httpError();

    // Act
    const message = toErrorMessage(error);

    // Assert
    expect(message).toBe(error.message);
  });

  it("should fall back to the error's message when the body is not an Error Envelope", () => {
    // Arrange
    const error = httpError({ detail: "nope" });

    // Act
    const message = toErrorMessage(error);

    // Assert
    expect(message).toBe(error.message);
  });

  it("should not leak schema detail when the response shape is wrong", () => {
    // Arrange
    // A SchemaError means the server sent something we cannot read. That is not
    // actionable by the person using the app, and naming the offending field
    // leaks our internals into a toast.
    const failure = Effect.runSync(
      Effect.flip(
        Schema.decodeUnknownEffect(Schema.Struct({ email: Schema.Finite }))({
          email: "nope",
        })
      )
    );

    // Act
    const message = toErrorMessage(failure);

    // Assert
    expect(failure._tag).toBe("SchemaError");
    expect(message).toBe(genericErrorMessage);
  });

  it("should read the message of any other Error", () => {
    // Arrange
    const error = new Error("Request timed out");

    // Act
    const message = toErrorMessage(error);

    // Assert
    expect(message).toBe("Request timed out");
  });

  it("should fall back to the generic message when the failure is not an Error", () => {
    // Arrange
    const failure = "boom";

    // Act
    const message = toErrorMessage(failure);

    // Assert
    expect(message).toBe(genericErrorMessage);
  });

  test.prop([fc.string(), fc.integer({ min: 400, max: 599 })])(
    "should always prefer the Error Envelope message",
    (envelopeMessage, status) => {
      // Arrange
      const error = httpError({ message: envelopeMessage }, status);

      // Act
      const message = toErrorMessage(error);

      // Assert
      expect(message).toBe(envelopeMessage);
    }
  );

  test.prop([fc.string()])(
    "should always read the message of a plain Error",
    (errorMessage) => {
      // Arrange
      const error = new Error(errorMessage);

      // Act
      const message = toErrorMessage(error);

      // Assert
      expect(message).toBe(errorMessage);
    }
  );

  test.prop([fc.anything()])(
    "should never throw for a failure that is not an Error",
    (failure) => {
      // Act
      const message = toErrorMessage(failure);

      // Assert
      expect(message).toBe(genericErrorMessage);
    }
  );
});
