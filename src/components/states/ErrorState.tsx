import type { ApiError } from '../../types/api'
import { Button } from '../ui/Button'

interface ErrorStateProps {
  error: ApiError
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 border-y border-border bg-surface-0 px-4 py-12 text-center">
      <p className="text-base font-medium text-text">Something went wrong</p>
      <p className="text-sm text-text-muted">{error.message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
      {error.requestId && (
        <p className="mt-2 text-xs text-text-muted">Request ID: {error.requestId}</p>
      )}
    </div>
  )
}
