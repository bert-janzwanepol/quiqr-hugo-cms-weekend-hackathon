import { scan } from 'react-scan'
import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
scan({
  enabled: false
})

import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { routeTree } from './routeTree.gen'
import { TipcProvider } from './context/TipcContext'
import { ThemeProvider } from './components/theme-provider'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent'
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: 'always',
      networkMode: 'offlineFirst'
    }
  }
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TipcProvider router={router}>
          <RouterProvider router={router} />
        </TipcProvider>{' '}
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
)
