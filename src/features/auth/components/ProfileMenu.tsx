import { useEffect, useRef, useState } from 'react'
import { Spinner } from '../../../components/ui/Spinner'
import { cn } from '../../../lib/cn'
import { useAuth } from '../useAuth'
import { PersonalDetailsDialog } from './PersonalDetailsDialog'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/** User menu pinned to the bottom of the sidebar: personal details + sign out. */
export function ProfileMenu() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  if (!user) return null

  const onSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      {menuOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-0 z-30 mb-1 w-full rounded-md border border-border bg-surface-0 py-1 shadow-overlay"
        >
          <button
            type="button"
            role="menuitem"
            className="block w-full px-3 py-1.5 text-left text-base text-text hover:bg-accent-tint"
            onClick={() => {
              setMenuOpen(false)
              setDetailsOpen(true)
            }}
          >
            Personal details
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-base text-text hover:bg-accent-tint disabled:opacity-60"
            onClick={() => void onSignOut()}
          >
            Sign out
            {signingOut && <Spinner />}
          </button>
        </div>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((current) => !current)}
        className={cn(
          'flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-2',
          menuOpen && 'bg-surface-2',
        )}
      >
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-tint text-sm font-semibold text-accent"
        >
          {initials(user.name)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-text">{user.name}</span>
          <span className="block truncate text-xs text-text-muted">{user.email}</span>
        </span>
      </button>
      <PersonalDetailsDialog open={detailsOpen} onOpenChange={setDetailsOpen} user={user} />
    </div>
  )
}
