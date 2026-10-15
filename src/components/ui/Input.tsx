import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

interface InputProps extends ComponentProps<'input'> {
  invalid?: boolean
}

export function Input({ invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        'h-8 w-full rounded-md border bg-surface-0 px-2.5 text-base text-text',
        'placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-60',
        invalid ? 'border-danger' : 'border-border',
        className,
      )}
      {...rest}
    />
  )
}
