/**
 * Hand-written from docs/API.md (contract v1.0.0).
 * Single source of truth for enums and resource shapes — keep in lockstep with the contract.
 */

export type Role = 'user' | 'admin'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type Status = 'open' | 'in_progress' | 'resolved' | 'closed'

export type ErrorCode =
  | 'VALIDATION_FAILED'
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_REFRESH_INVALID'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TICKET_INVALID_TRANSITION'
  | 'TICKET_CLOSED'
  | 'TICKET_NOT_EDITABLE'
  | 'CATEGORY_IN_USE'
  | 'CATEGORY_UNAVAILABLE'
  | 'UPLOAD_REJECTED'
  | 'RATE_LIMITED'
  | 'INTERNAL'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
  updatedAt: string
}

/** Embedded in tickets, comments and events. */
export interface UserRef {
  id: string
  name: string
  role: Role
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

/** `GET /admin/categories` adds usage and soft-delete info. */
export interface AdminCategory extends Category {
  ticketCount: number
  deletedAt: string | null
}

export type ScanStatus = 'pending' | 'clean' | 'skipped'

export interface Attachment {
  id: string
  originalName: string
  mimeType: string
  size: number
  uploadedBy: UserRef
  scanStatus: ScanStatus
  createdAt: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: Pick<Category, 'id' | 'name'>
  priority: Priority
  status: Status
  requester: UserRef
  assignee: UserRef | null
  attachments: Attachment[]
  commentCount: number
  lastActivityAt: string
  resolvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
}

/** List endpoints: Ticket minus `description` and `attachments`, plus `attachmentCount`. */
export interface TicketListItem extends Omit<Ticket, 'description' | 'attachments'> {
  attachmentCount: number
}

export interface Comment {
  id: string
  ticketId: string
  author: UserRef
  body: string
  isInternal: boolean
  createdAt: string
}

export type TicketEventType =
  | 'created'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'updated'
  | 'comment_added'
  | 'attachment_added'

export interface TicketEvent {
  id: string
  ticketId: string
  actor: UserRef
  type: TicketEventType
  changes: Record<string, { from: unknown; to: unknown }>
  createdAt: string
}

export interface Stats {
  byStatus: Record<Status, number>
  byPriority: Record<Priority, number>
  openAge: {
    count: number
    averageHours: number
    maxHours: number
    oldestTicketId: string | null
  }
  createdLast7Days: number
  total: number
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  meta: PageMeta
}

/** Normalised client-side error — every failed request is surfaced as one of these. */
export interface ApiError {
  code: ErrorCode
  message: string
  details?: { path: string; message: string }[]
  requestId?: string
  /** HTTP status, 0 when the request never reached the server. */
  status: number
}

/** Sort keys accepted by list endpoints (§6). */
export type SortKey =
  | 'createdAt'
  | '-createdAt'
  | 'lastActivityAt'
  | '-lastActivityAt'
  | 'priority'
  | '-priority'
