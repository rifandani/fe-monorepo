/* oxlint-disable eslint/func-style -- function declarations */
const validIANATimezoneCache: Record<string, boolean> = {};

/**
 * check if the provided timezone is supported or not
 */
export function isValidTimezoneIANAString(timeZoneString: string) {
  if (validIANATimezoneCache[timeZoneString]) {
    return true;
  }
  try {
    new Intl.DateTimeFormat(undefined, {
      timeZone: timeZoneString,
    }).resolvedOptions();
    validIANATimezoneCache[timeZoneString] = true;
    return true;
  } catch {
    // eslint-disable-next-line unused-imports/no-unused-vars
    return false;
  }
}

/**
 * The `getLocalTimeZone` from `@internationalized/date` will throw error in Chrome 118
 */
export function getLocalTimeZone() {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "GMT", // Asia/Jakarta
  }).resolvedOptions().timeZone;
}
