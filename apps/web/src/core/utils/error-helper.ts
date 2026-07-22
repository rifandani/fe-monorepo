export const simplifyErrorObject = (error: Error) => ({
  message: error.message,
  name: error.name,
  stack: error.stack,
});
export const errorAttributesFromUnknown = (caught: unknown) => {
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
};
