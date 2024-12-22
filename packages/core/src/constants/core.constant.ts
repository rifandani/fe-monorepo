export type Theme = 'system' | 'light' | 'dark'

export const themes: Theme[] = ['system', 'light', 'dark']

// object version of `themes`
export const modes = themes.reduce(
  (acc, item) => {
    acc[item] = item
    return acc
  },
  {} as Record<Theme, Theme>,
)

/**
 * "internationalized/date" library get our locale timezone using `Intl.DateTimeFormat().resolvedOptions()`.
 * In Chrome 118, the `timeZone` will return `undefined` which will cause the library to throw errors.
 */
export const RESOLVED_DATE_TIME_FORMAT_OPTIONS = Intl.DateTimeFormat('id-ID', {
  timeZone: 'GMT', // Asia/Jakarta
}).resolvedOptions()

export const kilobyteMultiplier = 1024
export const megabyteMultiplier = kilobyteMultiplier * 1024
export const gigabyteMultiplier = megabyteMultiplier * 1024

export const indoTimezone = ['WIB', 'WITA', 'WIT'] as const
