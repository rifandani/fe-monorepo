'use client'

import {
  SearchField as _SearchField,
  Button,
  type ButtonProps,
  Input,
  type InputProps,
  type SearchFieldProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

function SearchFieldInput({ className, ...props }: InputProps) {
  return (
    <Input
      className={values =>
        twMerge(
          'bg-background  min-w-0 flex-1 px-2 py-1.5 outline outline-0 [&::-webkit-search-cancel-button]:hidden',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function SearchField({ className, ...props }: SearchFieldProps) {
  return (
    <_SearchField
      className={values =>
        twMerge(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-within:ring-ring group flex h-10 w-full items-center overflow-hidden rounded-md border px-3 py-2 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 group-data-[disabled]:opacity-50',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function SearchFieldClear({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={values =>
        twMerge(
          'ring-offset-background mr-1 rounded-sm opacity-70 transition-opacity hover:opacity-100 group-data-[disabled]:pointer-events-none group-data-[empty]:invisible',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export { SearchField, SearchFieldClear, SearchFieldInput }
