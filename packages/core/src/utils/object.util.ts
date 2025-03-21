/**
 * Safely access deep values in an object via a string path seperated by `.`
 * This util is largely inspired by [dlv](https://github.com/developit/dlv/blob/master/index.js) and passes all its tests
 *
 * @param obj {Record<string, unknown>} - The object to parse
 * @param path {string} - The path to search in the object
 * @param [defaultValue] {unknown} -  A default value if the path doesn't exist in the object
 *
 * @returns {any} The value if found, the default provided value if set and not found, undefined otherwise
 *
 * @example
 *
 * ```js
 * const obj = { a: { b : { c: 'hello' } } };
 *
 * const value = deepReadObject(obj, 'a.b.c');
 * // => 'hello'
 * const notFound = deepReadObject(obj, 'a.b.d');
 * // => undefined
 * const notFound = deepReadObject(obj, 'a.b.d', 'not found');
 * // => 'not found'
 * ```
 */
export function deepReadObject<T = any>(obj: Record<string, unknown>, path: string, defaultValue?: unknown): T {
  const value = path
    .trim()
    .split('.')
    .reduce<any>((a, b) => (a ? a[b] : undefined), obj)

  return value !== undefined ? value : defaultValue as T
}
