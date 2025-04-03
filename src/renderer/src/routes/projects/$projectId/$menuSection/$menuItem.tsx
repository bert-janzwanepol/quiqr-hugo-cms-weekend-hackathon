import { createFileRoute } from '@tanstack/react-router'
import { useCurrentProject } from '../../../../context/TipcContext'
import FieldRenderer from '../../../../registry/FieldRenderer'

export const Route = createFileRoute('/projects/$projectId/$menuSection/$menuItem')({
  component: RouteComponent,
  beforeLoad: () => ({
    breadcrumb: (routeParams) => routeParams.menuItem
  })
})

function RouteComponent() {
  const { data: currentProject } = useCurrentProject()
  const { menuItem } = Route.useParams()

  const configFromSingles = currentProject?.indexedSingles[menuItem]
  const configFromCollections = currentProject?.indexedCollections[menuItem]

  // Determine which config to use
  const config = configFromSingles || configFromCollections

  if (!config) {
    return <div>Config for key {menuItem} not found in sinlges or collections.</div>
  }

  if (!config.fields) {
    return <div>No fields to display in this config.</div>
  }

  return (
    <div>
      {config.fields.map((field) => (
        <FieldRenderer key={`${field.key}-${field.type}`} field={field} />
      ))}

      <pre className="select-all whitespace-pre-wrap break-words user-select-auto">
        {JSON.stringify(config, null, 2)}
      </pre>
    </div>
  )
}
