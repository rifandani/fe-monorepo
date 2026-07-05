/* oxlint-disable eslint/func-style -- function declarations */
export function simplifyErrorObject(error: Error) {
  return {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
}
export function errorAttributesFromUnknown(caught: unknown) {
  if (caught instanceof Error) {
    return simplifyErrorObject(caught);
  }
  if (typeof caught === "string") {
    return { message: caught };
  }
  try {
    return { message: JSON.stringify(caught) };
  } catch {
    return { message: String(caught) };
  }
}
