const isProduction = process.env.NODE_ENV === "production";
const prefix = "Invariant failed";

export const invariant = (
  // oxlint-disable-next-line typescript/no-explicit-any -- assertion predicate accepts any condition
  condition: any,
  message?: string | (() => string)
): asserts condition => {
  const passed = Boolean(condition);

  if (passed) {
    return;
  }

  if (isProduction) {
    throw new Error(prefix);
  }

  const provided: string | undefined =
    typeof message === "function" ? message() : message;

  const value: string =
    provided === undefined || provided === ""
      ? prefix
      : `${prefix}: ${provided}`;

  throw new Error(value);
};
