import { createFileRoute } from '@tanstack/react-router'
import FieldRenderer from '@/registry/FieldRenderer'
import { useCurrentProject } from '@/lib/hooks/use-current-project'

export const Route = createFileRoute(
  '/projects/$projectId/$menuSection/$menuItem/$collectionConfig'
)({
  component: RouteComponent
})

function RouteComponent() {
  const { data: currentProject } = useCurrentProject()
  const { menuItem } = Route.useParams()

  const config = currentProject?.indexedCollections[menuItem]

  return (
    <div>
      {config?.fields?.map((field) => (
        <FieldRenderer key={`${field.key}-${field.type}`} field={field} />
      ))}
    </div>
  )
}
