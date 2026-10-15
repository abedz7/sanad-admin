import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { priorityLabels, priorityOrder, statusLabels, statusOrder } from '../../../lib/labels'
import type { Priority, Status } from '../../../types/api'
import { useCategories } from '../../categories/hooks'
import { useAdminUsers } from '../../users/hooks'

const ALL = 'all'

interface FilterBarProps {
  status: Status | undefined
  priority: Priority | undefined
  categoryId: string | undefined
  assigneeId: string | undefined
  unassigned: boolean
  q: string | undefined
  hasFilters: boolean
  /** Patch URL params; `undefined` deletes a key. */
  onChange: (updates: Record<string, string | undefined>) => void
  onClear: () => void
}

export function FilterBar({
  status,
  priority,
  categoryId,
  assigneeId,
  unassigned,
  q,
  hasFilters,
  onChange,
  onClear,
}: FilterBarProps) {
  const categories = useCategories()
  const admins = useAdminUsers({ role: 'admin' })

  const [searchDraft, setSearchDraft] = useState(q ?? '')
  const [prevQ, setPrevQ] = useState(q)
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Reflect external q changes (Clear filters, back button) into the input —
  // render-time adjustment, not an effect. Skip when the input already matches
  // (i.e. the change was our own debounce committing).
  if (prevQ !== q) {
    setPrevQ(q)
    if ((q ?? '') !== searchDraft.trim()) setSearchDraft(q ?? '')
  }

  useEffect(() => () => clearTimeout(debounce.current), [])

  const onSearchChange = (value: string) => {
    setSearchDraft(value)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      onChange({ q: value.trim() || undefined })
    }, 300)
  }

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center">
      <Select
        aria-label="Filter by status"
        className="max-md:w-full"
        value={status ?? ALL}
        onValueChange={(value) => onChange({ status: value === ALL ? undefined : value })}
        options={[
          { value: ALL, label: 'All statuses' },
          ...statusOrder.map((s) => ({ value: s, label: statusLabels[s].label })),
        ]}
      />
      <Select
        aria-label="Filter by priority"
        className="max-md:w-full"
        value={priority ?? ALL}
        onValueChange={(value) => onChange({ priority: value === ALL ? undefined : value })}
        options={[
          { value: ALL, label: 'All priorities' },
          ...priorityOrder.map((p) => ({ value: p, label: priorityLabels[p].label })),
        ]}
      />
      <Select
        aria-label="Filter by category"
        className="max-md:w-full"
        value={categoryId ?? ALL}
        disabled={!categories.isSuccess}
        onValueChange={(value) => onChange({ categoryId: value === ALL ? undefined : value })}
        options={[
          { value: ALL, label: 'All categories' },
          ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <Select
        aria-label="Filter by assignee"
        className="max-md:w-full"
        value={assigneeId ?? ALL}
        disabled={!admins.isSuccess || unassigned}
        onValueChange={(value) => onChange({ assigneeId: value === ALL ? undefined : value })}
        options={[
          { value: ALL, label: 'All assignees' },
          ...(admins.data?.data ?? []).map((a) => ({ value: a.id, label: a.name })),
        ]}
      />
      <label className="flex items-center gap-1.5 text-sm text-text">
        <input
          type="checkbox"
          checked={unassigned}
          onChange={(event) =>
            onChange({
              unassigned: event.target.checked ? 'true' : undefined,
              ...(event.target.checked ? { assigneeId: undefined } : {}),
            })
          }
          className="size-4 accent-(--accent)"
        />
        Unassigned
      </label>
      <Input
        type="search"
        aria-label="Search tickets"
        placeholder="Search title or description"
        className="col-span-2 w-full md:w-64"
        value={searchDraft}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {hasFilters && (
        <Button variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )
}
