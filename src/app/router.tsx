import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Skeleton } from '../components/states/Skeleton'
import { RequireAuth } from '../features/auth/RequireAuth'
import { AppShell } from './AppShell'

// Route-level code splitting keeps the initial bundle small; each page loads
// on first visit and is cached after that.
const SignInPage = lazy(() =>
  import('../features/auth/pages/SignInPage').then((m) => ({ default: m.SignInPage })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const TicketsPage = lazy(() =>
  import('../features/tickets/pages/TicketsPage').then((m) => ({ default: m.TicketsPage })),
)
const TicketDetailPage = lazy(() =>
  import('../features/tickets/pages/TicketDetailPage').then((m) => ({ default: m.TicketDetailPage })),
)
const CategoriesPage = lazy(() =>
  import('../features/categories/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
)

function page(node: ReactNode) {
  return <Suspense fallback={<Skeleton className="h-8 w-64" />}>{node}</Suspense>
}

export const router = createBrowserRouter([
  { path: '/sign-in', element: page(<SignInPage />) },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: page(<DashboardPage />) },
          { path: '/tickets', element: page(<TicketsPage />) },
          { path: '/tickets/:id', element: page(<TicketDetailPage />) },
          { path: '/categories', element: page(<CategoriesPage />) },
        ],
      },
    ],
  },
])
