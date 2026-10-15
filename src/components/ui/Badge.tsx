import { cn } from '../../lib/cn'
import { priorityLabels, statusLabels } from '../../lib/labels'
import type { Priority, Status } from '../../types/api'

type BadgeProps = { status: Status; priority?: never } | { priority: Priority; status?: never }

/** Status/priority chip — label and colours come from lib/labels.ts only. */
export function Badge(props: BadgeProps) {
  const def = props.status !== undefined ? statusLabels[props.status] : priorityLabels[props.priority]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap',
        def.className,
      )}
    >
      {def.label}
    </span>
  )
}
