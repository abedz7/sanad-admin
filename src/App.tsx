import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './features/auth/AuthProvider'
import { queryClient } from './lib/queryClient'
import { router } from './app/router'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
