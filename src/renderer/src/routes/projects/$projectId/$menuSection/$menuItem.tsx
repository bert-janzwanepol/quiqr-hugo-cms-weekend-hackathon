import { createFileRoute } from '@tanstack/react-router'
import { useCurrentProject, useTipc } from '../../../../context/TipcContext'
import FieldRenderer from '../../../../registry/FieldRenderer'
import { useEffect } from 'react'
import { isCollectionConfig, isCollectionConfigEntry } from '../../../../../../shared/types'

export const Route = createFileRoute('/projects/$projectId/$menuSection/$menuItem')({
  component: RouteComponent,
  beforeLoad: () => ({
    breadcrumb: (routeParams) => routeParams.menuItem
  })
})

function RouteComponent() {
  const { data: currentProject } = useCurrentProject()
  const { client, getCurrentProjectParams } = useTipc()
  const { projectName, projectPath } = getCurrentProjectParams()

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

  // we can not put the hook useQuery in an if statement
  // because conditional hooks are not allowed in React.
  // @see https://react.dev/reference/rules/rules-of-hooks
  const folder = 'folder' in config ? config.folder : ''
  const { data } = client.listDataDirectory.useQuery(
    {
      projectPath,
      projectName,
      contentDirPath: folder
    },
    {
      enabled: folder != ''
    }
  )

  return (
    <div>
      {/* {config.fields.map((field) => (
        <FieldRenderer key={`${field.key}-${field.type}`} field={field} />
      ))} */}

      <pre className="select-all whitespace-pre-wrap break-words user-select-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
