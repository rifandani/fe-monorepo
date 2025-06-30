import { twMerge } from 'tailwind-merge'

interface HeadingProps extends React.ComponentProps<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

function Heading({ className, level = 1, ...props }: HeadingProps) {
  const Element: `h${typeof level}` = `h${level}`
  return (
    <Element
      className={twMerge(
        'font-sans text-fg',
        level === 1 && `
          text-xl font-semibold
          sm:text-2xl
        `,
        level === 2 && `
          text-lg font-semibold
          sm:text-xl
        `,
        level === 3 && `
          text-base font-semibold
          sm:text-lg
        `,
        level === 4 && 'text-base font-semibold',
        className,
      )}
      {...props}
    />
  )
}

export type { HeadingProps }
export { Heading }
