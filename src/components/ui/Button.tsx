import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Spinner } from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-strong border border-transparent',
  secondary: 'bg-surface-0 text-text border border-border hover:bg-surface-2',
  ghost: 'bg-transparent text-text border border-transparent hover:bg-accent-tint',
  danger: 'bg-danger text-white border border-transparent hover:opacity-90',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2 text-sm',
  md: 'h-8 px-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors duration-120 disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      {/* Spinner overlays the hidden label so the button keeps its width. */}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
      <span className={cn('inline-flex items-center gap-2', loading && 'invisible')}>
        {children}
      </span>
    </button>
  )
}
