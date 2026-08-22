/** A form error is a plain message, an issue object, or a list of either. */
const isMessage = <T>(value: T): value is T & string =>
  typeof value === "string";

const hasMessage = <T>(value: T): value is T & { message: string } =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string";

const firstIssueMessage = <T>(value: T): string | undefined => {
  if (isMessage(value)) {
    return value;
  }
  if (!Array.isArray(value)) {
    return undefined;
  }
  const first: unknown = value[0];
  if (isMessage(first)) {
    return first;
  }
  return hasMessage(first) ? first.message : undefined;
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
