import { NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'
import { useAuth } from '../features/auth/useAuth'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tickets', label: 'Tickets', end: false },
  { to: '/categories', label: 'Categories', end: false },
]

export function AppShell() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-border bg-surface-0">
        <div className="border-b border-border px-4 py-1">
          {/* The artwork carries ~35% whitespace padding, so the rendered box is
              larger than the visible mark (~16px high — still a mark, not a hero). */}
          <img src="/logo.png" alt="Sanad" className="h-12 w-auto" />
        </div>
        <nav aria-label="Main" className="flex flex-col gap-0.5 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'rounded-md border-l-2 px-3 py-1.5 text-base font-medium',
                  isActive
                    ? 'border-accent bg-accent-tint text-accent'
                    : 'border-transparent text-text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-3">
          <p className="truncate text-sm font-medium text-text">{user?.name}</p>
          <p className="truncate text-xs text-text-muted">{user?.email}</p>
          <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </aside>
      <main className="ml-60 min-w-0 flex-1">
        <div className="mx-auto max-w-[1280px] px-6 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
