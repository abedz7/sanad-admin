import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearAccessToken,
  refreshAccessToken,
  SESSION_EXPIRED_EVENT,
  setAccessToken,
} from '../../lib/api'
import { queryClient } from '../../lib/queryClient'
import type { User } from '../../types/api'
import { login as loginRequest, logout as logoutRequest, me } from './api'

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

export interface AuthContextValue {
  status: AuthStatus
  user: User | null
  /** True when the last sign-out was forced by an expired session. */
  sessionExpired: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  /** Re-fetch /auth/me and update the session user (after a profile edit). */
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// Module-level so React StrictMode's double-mounted effect shares ONE refresh
// call — two concurrent refreshes would trip the server's rotation-reuse guard.
let bootPromise: Promise<User | null> | null = null

function bootstrapSession(): Promise<User | null> {
  if (!bootPromise) {
    bootPromise = (async () => {
      try {
        await refreshAccessToken()
        return await me()
      } catch {
        clearAccessToken()
        return null
      }
    })()
  }
  return bootPromise
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    let cancelled = false
    void bootstrapSession().then((restoredUser) => {
      if (cancelled) return
      setUser(restoredUser)
      setStatus(restoredUser ? 'signedIn' : 'signedOut')
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const onSessionExpired = () => {
      setUser(null)
      setStatus('signedOut')
      setSessionExpired(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { user: signedInUser, accessToken } = await loginRequest({ email, password })
    setAccessToken(accessToken)
    setUser(signedInUser)
    setSessionExpired(false)
    setStatus('signedIn')
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // Clear local state regardless — the server call is best-effort.
    } finally {
      clearAccessToken()
      queryClient.clear()
      bootPromise = null
      setUser(null)
      setSessionExpired(false)
      setStatus('signedOut')
    }
  }, [])

  const refreshUser = useCallback(async () => {
    setUser(await me())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, sessionExpired, signIn, signOut, refreshUser }),
    [status, user, sessionExpired, signIn, signOut, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
