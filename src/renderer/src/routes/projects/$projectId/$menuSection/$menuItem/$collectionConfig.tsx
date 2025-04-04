import { createFileRoute } from '@tanstack/react-router'
import { useCurrentProject, useTipc } from '../../../../../context/TipcContext'
import { useEffect } from 'react'

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

  // return config.fields.map((field) => (
  //   <FieldRenderer key={`${field.key}-${field.type}`} field={field} />
  // ))
  return (
    <pre className="select-all whitespace-pre-wrap break-words user-select-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
