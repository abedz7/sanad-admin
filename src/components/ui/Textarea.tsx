import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

interface TextareaProps extends ComponentProps<'textarea'> {
  invalid?: boolean
}

export function Textarea({ invalid = false, className, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-md border bg-surface-0 px-2.5 py-1.5 text-base text-text',
        'placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-60',
        invalid ? 'border-danger' : 'border-border',
        className,
      )}
      {...rest}
    />
  )
}
