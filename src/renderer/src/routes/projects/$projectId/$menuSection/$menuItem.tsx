import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectId/$menuSection/$menuItem')({
  component: RouteComponent,
  beforeLoad: () => ({
    breadcrumb: (routeParams) => routeParams.menuItem
  })
})

function RouteComponent() {
  return (
    <div>
      <div>Hello /projects/$projectId/$menuSection/$menuItem!</div>
    </div>
  )
}
