import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/_layout')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>/projects/_layout</div>
}
