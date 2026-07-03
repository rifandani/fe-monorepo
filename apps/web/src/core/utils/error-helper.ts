export function simplifyErrorObject(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }
}

/** For `catch (e)` where `e` is unknown — safe OTEL / log attributes */
export function errorAttributesFromUnknown(caught: unknown) {
  if (caught instanceof Error) {
    return simplifyErrorObject(caught)
  }
  if (typeof caught === 'string') {
    return { message: caught }
  }
  try {
    return { message: JSON.stringify(caught) }
  }
  catch {
    return { message: String(caught) }
  }
}
