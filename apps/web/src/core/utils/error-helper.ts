export const simplifyErrorObject = (error: Error) => ({
  message: error.message,
  name: error.name,
  stack: error.stack,
});
/** JS lets any value be thrown, so this accepts whatever the `catch` produced. */
const isString = <T>(value: T): value is T & string =>
  typeof value === "string";

export const errorAttributesFromUnknown = <T>(caught: T) => {
  if (caught instanceof Error) {
    return simplifyErrorObject(caught);
  }
  if (isString(caught)) {
    return { message: caught };
  }
  try {
    return { message: JSON.stringify(caught) };
  } catch {
    return { message: String(caught) };
  }
};
