import { isFunction } from "radashi";

const isProduction = process.env.NODE_ENV === "production";
const prefix = "Invariant failed";

export const invariant: (
  condition: unknown,
  message?: string | (() => string)
) => asserts condition = (condition, message) => {
  const passed = Boolean(condition);

  if (passed) {
    return;
  }

  if (isProduction) {
    throw new Error(prefix);
  }

  const provided: string | undefined = isFunction(message)
    ? message()
    : message;

  const value: string =
    provided === undefined || provided === ""
      ? prefix
      : `${prefix}: ${provided}`;

  throw new Error(value);
};
