import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/create')({
  component: RouteComponent
})

function RouteComponent() {
  return <div>Hello /projects/create!</div>
}
