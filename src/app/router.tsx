import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '../features/auth/RequireAuth'
import { SignInPage } from '../features/auth/pages/SignInPage'
import { CategoriesPage } from '../features/categories/pages/CategoriesPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { TicketDetailPage } from '../features/tickets/pages/TicketDetailPage'
import { TicketsPage } from '../features/tickets/pages/TicketsPage'
import { AppShell } from './AppShell'

export const router = createBrowserRouter([
  { path: '/sign-in', element: <SignInPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/tickets', element: <TicketsPage /> },
          { path: '/tickets/:id', element: <TicketDetailPage /> },
          { path: '/categories', element: <CategoriesPage /> },
        ],
      },
    ],
  },
])
