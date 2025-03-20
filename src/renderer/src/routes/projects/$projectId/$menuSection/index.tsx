import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$projectId/$menuSection/')({
  component: RouteComponent,
  beforeLoad: () => ({
    breadcrumb: (params) => params.menuSection
  })
})

function RouteComponent() {
  return (
    <div>
      <div>Hello /projects/$projectId/$menuSection!</div>
    </div>
  )
}
