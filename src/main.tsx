import './index.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import App from './App'
import { SetupScreen } from './components/layout/SetupScreen'
import { ThemedToaster } from './components/layout/ThemedToaster'
import { AuthProvider } from './features/auth/AuthProvider'
import { missingEnv } from './lib/env'
import { watchSystemTheme } from './lib/theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // Don't retry "not allowed" or validation errors, only flaky network.
      retry: (failures, error) =>
        failures < 2 && !(error as { code?: string } | null)?.code,
    },
  },
})

watchSystemTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {missingEnv.length > 0 ? (
      <SetupScreen missing={missingEnv} />
    ) : (
      <QueryClientProvider client={queryClient}>
        {/* BASE_URL is "/cartly/" on GitHub Pages, "/" locally. */}
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        <ThemedToaster />
      </QueryClientProvider>
    )}
  </StrictMode>,
)
