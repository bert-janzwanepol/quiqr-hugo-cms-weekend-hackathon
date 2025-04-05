import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import FieldRenderer from '@/registry/FieldRenderer'
import { useCurrentProject } from '@/lib/hooks/use-current-project'
import { useTipc } from '@/lib/hooks/use-tipc'

export const Route = createFileRoute(
  '/projects/$projectId/$menuSection/$menuItem/$collectionConfig'
)({
  component: RouteComponent
})

function RouteComponent() {
  const { data: currentProject } = useCurrentProject()
  const { menuItem, collectionConfig } = Route.useParams()
  const { client, getCurrentProjectParams } = useTipc()

  const { projectName, projectPath } = getCurrentProjectParams()
  const config = currentProject?.indexedCollections[menuItem]

  const { data } = client.loadDataFile.useQuery(
    {
      projectPath,
      projectName,
      contentDirPath: config?.folder || '',
      filename: collectionConfig
    },
    {
      enabled: Boolean(config?.folder) && Boolean(collectionConfig)
    }
  )

  useEffect(() => {
    console.log(data)
    console.log(config?.dataformat, config?.extension)
  }, [data, config])

  // const config = currentProject?.collectionsConfig[menuItem][collectionConfig]

  return (
    <div>
      {config?.fields?.map((field) => (
        <FieldRenderer key={`${field.key}-${field.type}`} field={field} />
      ))}
    </div>
  )
}
