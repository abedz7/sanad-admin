import * as RadixDialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../lib/cn'
import { ProfileMenu } from '../features/auth/components/ProfileMenu'

const navItems = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tickets', label: 'Tickets', end: false },
  { to: '/categories', label: 'Categories', end: false },
]

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5 p-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-md border-l-2 px-3 py-1.5 text-base font-medium transition-colors duration-120',
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
  )
}

function HamburgerIcon() {
  return (
    <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar (≥1024px) */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-surface-0 lg:flex">
        <div className="border-b border-border px-4 py-2">
          <img src="/logo.png" alt="Sanad" className="w-[110px]" />
        </div>
        <NavList />
        <div className="mt-auto border-t border-border">
          <ProfileMenu />
        </div>
      </aside>

      {/* Mobile/tablet top bar (<1024px) */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-surface-0 px-4 lg:hidden">
        <img src="/logo.png" alt="Sanad" className="w-[96px]" />
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-1.5 text-text hover:bg-surface-2"
        >
          <HamburgerIcon />
        </button>
      </header>

      {/* Drawer (Radix Dialog) */}
      <RadixDialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <RadixDialog.Portal>
          <RadixDialog.Overlay className="dialog-overlay-anim fixed inset-0 z-40 bg-black/40 lg:hidden" />
          <RadixDialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[calc(100vw-48px)] flex-col border-r border-border bg-surface-0 shadow-elevation-2 lg:hidden"
          >
            <RadixDialog.Title className="sr-only">Navigation</RadixDialog.Title>
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <img src="/logo.png" alt="Sanad" className="w-[110px]" />
              <RadixDialog.Close
                aria-label="Close menu"
                className="rounded-md px-1.5 text-lg leading-none text-text-muted hover:bg-surface-2"
              >
                ×
              </RadixDialog.Close>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-auto border-t border-border">
              <ProfileMenu />
            </div>
          </RadixDialog.Content>
        </RadixDialog.Portal>
      </RadixDialog.Root>

      <main className="pt-12 lg:ml-60 lg:pt-0">
        <div className="page-reveal mx-auto max-w-[1280px] px-4 py-4 md:px-6 md:py-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
