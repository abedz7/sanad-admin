import type { Priority, Status } from '../types/api'

/**
 * Single source of truth for status/priority presentation and the admin
 * status machine (docs/API.md §5, admin column). The server still decides —
 * this only controls which transitions the UI offers.
 */

interface LabelDef {
  label: string
  /** Tailwind classes kept as full literals so the scanner picks them up. */
  className: string
}

export const statusLabels: Record<Status, LabelDef> = {
  open: { label: 'Open', className: 'text-status-open bg-status-open-bg' },
  in_progress: { label: 'In progress', className: 'text-status-in-progress bg-status-in-progress-bg' },
  resolved: { label: 'Resolved', className: 'text-status-resolved bg-status-resolved-bg' },
  closed: { label: 'Closed', className: 'text-status-closed bg-status-closed-bg' },
}

export const priorityLabels: Record<Priority, LabelDef> = {
  low: { label: 'Low', className: 'text-priority-low bg-priority-low-bg' },
  medium: { label: 'Medium', className: 'text-priority-medium bg-priority-medium-bg' },
  high: { label: 'High', className: 'text-priority-high bg-priority-high-bg' },
  urgent: { label: 'Urgent', className: 'text-priority-urgent bg-priority-urgent-bg' },
}

export interface AdminTransition {
  to: Status
  /** Verb shown on the button that triggers this transition. */
  label: string
}

/** Transitions an admin may trigger from each status (contract §5, admin column). */
const adminTransitions: Record<Status, AdminTransition[]> = {
  open: [
    { to: 'in_progress', label: 'Start working' },
    { to: 'closed', label: 'Close' },
  ],
  in_progress: [
    { to: 'resolved', label: 'Mark resolved' },
    { to: 'open', label: 'Back to open' },
    { to: 'closed', label: 'Close' },
  ],
  resolved: [
    { to: 'in_progress', label: 'Reopen' },
    { to: 'closed', label: 'Close' },
  ],
  closed: [{ to: 'open', label: 'Reopen' }],
}

export function allowedAdminTransitions(status: Status): AdminTransition[] {
  return adminTransitions[status]
}

export const statusOrder: Status[] = ['open', 'in_progress', 'resolved', 'closed']
export const priorityOrder: Priority[] = ['low', 'medium', 'high', 'urgent']
