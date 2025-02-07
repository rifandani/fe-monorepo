import type { ZodError } from 'zod'
import type { FromZodErrorOptions } from 'zod-validation-error'
import { deepReadObject } from '@workspace/core/utils/object.util'
import React from 'react'
import { fromZodError } from 'zod-validation-error'

// declare a type that works with generic components
type FixedForwardRef = <T, P = object>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
) => (props: P & React.RefAttributes<T>) => React.ReactNode

// cast the old forwardRef to the new one
export const fixedForwardRef = React.forwardRef as FixedForwardRef

/**
 * Provided a string template it will replace dynamics parts in place of variables.
 * This util is largely inspired by [templite](https://github.com/lukeed/templite/blob/master/src/index.js)
 *
 * @param str {string} - The string you wish to use as template
 * @param params {Record<string, string>} - The params to inject into the template
 * @param reg {RegExp} - The RegExp used to find and replace. Default to `/{{(.*?)}}/g`
 *
 * @returns {string} - The fully injected template
 *
 * @example
 * ```ts
 * const txt = template('Hello {{ name }}', { name: 'Tom' });
 * // => 'Hello Tom'
 * ```
 */
export function template(str: string, params: Record<string, string>, reg = /\{\{(.*?)\}\}/g): string {
  return str.replace(reg, (_, key: string) => deepReadObject(params, key, ''))
}

export function clamp({ value, min, max }: { value: number, min: number, max: number }) {
  return Math.min(Math.max(value, min), max)
}

/**
 * Format phone number based on mockup, currently only covered minimum 11 characters and max 15 characters include +62
 * e.g +62-812-7363-6365
 *
 * @param phoneNumber
 */
export function indonesianPhoneNumberFormat(phoneNumber?: string) {
  if (!phoneNumber)
    return ''
  // e.g: +62
  const code = phoneNumber.slice(0, 3)
  const numbers = phoneNumber.slice(3)
  // e.g 812, 852
  const ndc = numbers.slice(0, 3)
  // e.g the rest of the numbers
  const uniqNumber = numbers.slice(3)
  let regexp: RegExp

  if (uniqNumber.length <= 6) {
    regexp = /(\d{3})(\d+)/
  }
  else if (uniqNumber.length === 7) {
    regexp = /(\d{3})(\d{4})/
  }
  else if (uniqNumber.length === 8) {
    regexp = /(\d{4})(\d{4})/
  }
  else {
    regexp = /(\d{4})(\d{5,})/
  }

  const matches = uniqNumber.replace(regexp, '$1-$2')

  return [code, ndc, matches].join('-')
}

/**
 * convert deep nested object keys to camelCase.
 */
export function toCamelCase<T>(object: unknown): T {
  let transformedObject = object as Record<string, unknown>
  if (typeof object === 'object' && object !== null) {
    if (Array.isArray(object)) {
      transformedObject = object.map(toCamelCase) as unknown as Record<string, unknown>
    }
    else {
      transformedObject = {}
      Object.keys(object).forEach((key) => {
        if ((object as Record<string, unknown>)[key] !== undefined) {
          const firstUnderscore = key.replace(/^_/, '')
          const newKey = firstUnderscore.replace(/(_\w)|(-\w)/g, k => k[1].toUpperCase())
          transformedObject[newKey] = toCamelCase((object as Record<string, unknown>)[key])
        }
      })
    }
  }
  return transformedObject as T
}

/**
 * convert deep nested object keys to snake_case.
 */
export function toSnakeCase<T>(object: unknown): T {
  let transformedObject = object as Record<string, unknown>
  if (typeof object === 'object' && object !== null) {
    if (Array.isArray(object)) {
      transformedObject = object.map(toSnakeCase) as unknown as Record<string, unknown>
    }
    else {
      transformedObject = {}
      Object.keys(object).forEach((key) => {
        if ((object as Record<string, unknown>)[key] !== undefined) {
          const newKey = key
            .replace(/\.?([A-Z]+)/g, (_, y) => `_${y ? (y as string).toLowerCase() : ''}`)
            .replace(/^_/, '')
          transformedObject[newKey] = toSnakeCase((object as Record<string, unknown>)[key])
        }
      })
    }
  }
  return transformedObject as T
}

/**
 * Remove leading zero
 */
export function removeLeadingZeros(value: string) {
  // eslint-disable-next-line regexp/no-unused-capturing-group
  if (/^(0+)([1-9]+)/.test(value)) {
    return value.replace(/^(0)/, '')
  }

  return value.replace(/^0{2,}/, '0')
}

/**
 * Remove leading whitespaces
 */
export function removeLeadingWhitespace(value?: string) {
  if (!value)
    return ''
  if (/^\s*$/.test(value)) {
    return value.replace(/^\s*/, '')
  }

  return value
}

/**
 * simple zod error message wrapped in an object
 */
export function simplifyZodError<T>(error: ZodError<T>, options?: FromZodErrorOptions) {
  return { message: fromZodError(error, options).message }
}
