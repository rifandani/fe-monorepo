import { twMerge } from 'tailwind-merge'

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card"
      className={twMerge(
        `
          group/card flex flex-col gap-(--card-spacing) rounded-lg border bg-bg
          py-(--card-spacing) text-fg shadow-xs
          [--card-spacing:--spacing(6)]
          has-[table]:overflow-hidden
          has-[table]:not-has-data-[slot=card-footer]:pb-0
          has-[table]:**:data-[slot=card-footer]:border-t
          **:data-[slot=table-header]:bg-muted/50 **:[table]:overflow-hidden
        `,
        className,
      )}
      {...props}
    />
  )
}

interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

function CardHeader({ className, title, description, children, ...props }: HeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={twMerge(
        `
          grid auto-rows-min grid-rows-[auto_auto] items-start gap-1
          px-(--card-spacing)
          has-data-[slot=card-action]:grid-cols-[1fr_auto]
        `,
        className,
      )}
      {...props}
    >
      {title && <CardTitle>{title}</CardTitle>}
      {description && <CardDescription>{description}</CardDescription>}
      {!title && typeof children === 'string' ? <CardTitle>{children}</CardTitle> : children}
    </div>
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={twMerge(`
        text-lg/6 font-semibold text-balance text-fg
        sm:text-base/6
      `, className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      data-slot="card-description"
      className={twMerge('row-start-2 text-sm text-pretty text-muted-fg', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-action"
      className={twMerge(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-content"
      className={twMerge(`
        px-(--card-spacing)
        has-[table]:border-t
      `, className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="card-footer"
      className={twMerge(
        `
          flex items-center px-(--card-spacing)
          group-has-[table]/card:pt-(--card-spacing)
          [.border-t]:pt-6
        `,
        className,
      )}
      {...props}
    />
  )
}

Card.Content = CardContent
Card.Description = CardDescription
Card.Footer = CardFooter
Card.Header = CardHeader
Card.Title = CardTitle
Card.Action = CardAction

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
