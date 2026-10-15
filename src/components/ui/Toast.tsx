import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'
import { API_ERROR_TOAST_EVENT } from '../../lib/queryClient'

type ToastTone = 'info' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside <ToastProvider>')
  return value
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const toast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = nextId.current++
    setItems((current) => [...current, { id, message, tone }])
    setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 5000)
  }, [])

  // API errors no component handled locally (see lib/queryClient.ts).
  useEffect(() => {
    const onApiError = (event: Event) => toast((event as CustomEvent<string>).detail, 'error')
    window.addEventListener(API_ERROR_TOAST_EVENT, onApiError)
    return () => window.removeEventListener(API_ERROR_TOAST_EVENT, onApiError)
  }, [toast])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'toast-in rounded-md border bg-surface-0 px-3 py-2 text-base text-text shadow-elevation-2',
              item.tone === 'error' ? 'border-danger' : 'border-border',
            )}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
