import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '../../components/states/Skeleton'
import { useAuth } from './useAuth'

/** Route guard: waits for the session bootstrap, then gates on signed-in. */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (status === 'signedOut') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}
