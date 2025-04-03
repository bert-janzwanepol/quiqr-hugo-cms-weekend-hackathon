import { createRootRouteWithContext, useRouter } from '@tanstack/react-router'
import App from '../App'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Suspense, useEffect, useRef } from 'react'

export interface RouterContext {
  breadcrumb?: string | ((params: Record<string, string>) => string)
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => <RootComponent />
})

const RootComponent = () => {
  const router = useRouter()
  const previousPathRef = useRef<string | null>(null)

  // TODO: refactor so we can remove this, probably move this to an init/preload method
  // TODO: become a pro at electron + react + ipc
  // TODO: figure out same frame navigation events in SPAs + electron
  // Because we use @tanstack/router, regular navigation events
  // apparently do not work. That's why we send
  useEffect(() => {
    // Track initial navigation
    window.electronNavigation.sendNavigationEvent({
      pathname: router.state.location.pathname,
      search: router.state.location.search,
      isInitial: true
    })

    // Set initial previous path
    previousPathRef.current = router.state.location.pathname

    // Track subsequent navigations
    const unsubscribe = router.history.subscribe(() => {
      const currentLocation = router.state.location
      const currentPath = currentLocation.pathname

      // Skip if it's the same path
      if (previousPathRef.current === currentPath) return

      // Send the navigation event
      window.electronNavigation.sendNavigationEvent({
        pathname: currentPath,
        search: currentLocation.search,
        previous: previousPathRef.current
      })

      // Update previous path
      previousPathRef.current = currentPath
    })

    return unsubscribe
  }, [router])

  return (
    <>
      <App />
      <Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </Suspense>
    </>
  )
}
