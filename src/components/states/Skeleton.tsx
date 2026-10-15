import { cn } from '../../lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('skeleton rounded-md', className)} />
}

/** Placeholder rows matching table geometry while a list loads. */
export function SkeletonRows({ rows = 8 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="border-y border-border bg-surface-0">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex gap-4 border-t border-border px-3 py-3 first:border-t-0">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-4 w-1/5" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  )
}
