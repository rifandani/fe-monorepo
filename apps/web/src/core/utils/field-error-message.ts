const firstIssueMessage = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const [first] = value;
    if (typeof first === "string") {
      return first;
    }
    if (
      typeof first === "object" &&
      first !== null &&
      "message" in first &&
      typeof first.message === "string"
    ) {
      return first.message;
    }
  }
  return undefined;
};

/**
 * First displayable error from a TanStack Form field errorMap
 * (Zod onChange issues or string onSubmit / onServer errors).
 */
export const fieldErrorMessage = (errorMap: {
  onChange?: unknown;
  onSubmit?: unknown;
  onServer?: unknown;
}): string | undefined =>
  firstIssueMessage(errorMap.onChange) ??
  firstIssueMessage(errorMap.onSubmit) ??
  firstIssueMessage(errorMap.onServer);
