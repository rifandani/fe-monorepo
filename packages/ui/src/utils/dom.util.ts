import type { URLSearchParamsInit } from '@workspace/ui/types/core.type'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Check if we are in browser, not server
 */
export const isBrowser = () => typeof window !== 'undefined'

/**
 * This will works with below rules, otherwise it only view on new tab
 * 1. If the file source located in the same origin as the application.
 * 2. If the file source is on different location e.g s3 bucket, etc. Set the response headers `Content-Disposition: attachment`.
 */
export function doDownload(url: string) {
  if (!url)
    return
  const link = document.createElement('a')
  link.href = url
  link.download = url
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * create merge function with custom config which extends the default config.
 * Use this if you use the default Tailwind config and just extend it in some places.
 */
export const tw = extendTailwindMerge<'alert'>({
  extend: {
    classGroups: {
      // ↓ The `foo` key here is the class group ID
      //   ↓ Creates group of classes which have conflicting styles
      //     Classes here: 'alert-info', 'alert-success', 'alert-warning', 'alert-error'
      alert: ['alert-info', 'alert-success', 'alert-warning', 'alert-error'],
    },
    // ↓ Here you can define additional conflicts across different groups
    conflictingClassGroups: {
      // ↓ ID of class group which creates a conflict with…
      //     ↓ …classes from groups with these IDs
      // In this case `tw('alert-success alert-error') → 'alert-error'`
      alert: ['alert'],
    },
  },
})

/**
 * Creates a URLSearchParams object using the given initializer.
 *
 * This is identical to `new URLSearchParams(init)` except it also
 * supports arrays as values in the object form of the initializer
 * instead of just strings. This is convenient when you need multiple
 * values for a given key, but don't want to use an array initializer.
 *
 * For example, instead of:
 *
 * ```tsx
 * let searchParams = new URLSearchParams([
 *   ['sort', 'name'],
 *   ['sort', 'price']
 * ]);
 * ```
 * you can do:
 *
 * ```
 * let searchParams = createSearchParams({
 *   sort: ['name', 'price']
 * });
 * ```
 */
export function createSearchParams(
  init: URLSearchParamsInit = '',
): URLSearchParams {
  return new URLSearchParams(
    typeof init === 'string'
    || Array.isArray(init)
    || init instanceof URLSearchParams
      ? init
      : Object.keys(init).reduce((memo, key) => {
          const value = init[key]
          return memo.concat(
            Array.isArray(value) ? value.map(v => [key, v]) : [[key, value as string]],
          )
        }, [] as [string, string][]),
  )
}

/**
 * instead of using `createSearchParams`, this function will convert an object into a URLSearchParams and joins array of string value with a comma
 *
 * @example
 *
 * const searchParams = createSearchParamsWithComa({
 *   sort: 'asc',
 *   filters: [
 *     "model",
 *     "category",
 *   ]
 * });
 *
 * // returns => sort=asc&filters=model,category
 * // instead of => sort=asc&filters=model&filters=category
 */
export function createSearchParamsWithComma(init?: URLSearchParamsInit) {
  const searchParams = init ? createSearchParams(init) : new URLSearchParams()

  // replace array of string values with a comma separated value
  for (const [key, value] of Object.entries(init ?? {})) {
    if (Array.isArray(value)) {
      searchParams.delete(key)
      searchParams.set(key, value.join(','))
    }
  }

  return searchParams
}

interface ExperimentalNavigator {
  userAgentData?: {
    brands: { brand: string, version: string }[]
    mobile: boolean
    platform: string
    getHighEntropyValues: (hints: string[]) => Promise<{
      platform: string
      platformVersion: string
      uaFullVersion: string
    }>
  }
}

/**
 * Retrieves the current platform
 *
 * This function uses the `UserAgentData` API if available, otherwise falls back to the
 * `navigator.platform` property
 *
 * @returns {string} The platform name
 */
export function getPlatform(): string {
  const nav = navigator as ExperimentalNavigator

  if (nav?.userAgentData?.platform) {
    return nav.userAgentData.platform
  }

  let platform = ''

  nav.userAgentData
    ?.getHighEntropyValues(['platform'])
    .then((highEntropyValues: { platform: string }) => {
      if (highEntropyValues.platform) {
        platform = highEntropyValues.platform
      }
    })

  if (typeof navigator.platform === 'string') {
    return navigator.platform
  }

  return platform
}

/**
 * Checks if the current platform is macOS
 *
 * @returns {boolean} `true` if the current platform is macOS, `false` otherwise
 */
export function isMacOS(): boolean {
  return getPlatform().toLowerCase().includes('mac')
}

/**
 * Retrieves the shortcut key for a given key
 *
 * @param {string} key - The key to retrieve the shortcut for
 * @returns {string} The shortcut key for the given key
 */
export function getShortcutKey(key: string): string {
  if (key.toLowerCase() === 'mod') {
    return isMacOS() ? '⌘' : 'Ctrl'
  }
  if (key.toLowerCase() === 'alt') {
    return isMacOS() ? '⌥' : 'Alt'
  }
  if (key.toLowerCase() === 'shift') {
    return isMacOS() ? '⇧' : 'Shift'
  }
  return key
}

/**
 * Generates a string of shortcut keys for a given array of keys.
 *
 * @param {string[]} keys - The array of keys to generate shortcut keys for
 * @returns {string} A string of shortcut keys separated by spaces
 *
 * @example getShortcutKeys(['Ctrl', 'Shift', 'A']) 'Ctrl+Shift+A'
 * @example getShortcutKeys(['mod', 'N']) '⌘N' (on macOS)
 * @example getShortcutKeys(['mod', 'N']) 'Ctrl+N' (on non-macOS)
 */
export function getShortcutKeys(keys: string[]): string {
  return keys.map(key => getShortcutKey(key)).join('+')
}
