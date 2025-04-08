import { useCurrentProject } from './use-current-project'
import { Route as CollectionRoute } from '@/routes/projects/$projectId/$menuSection/$menuItem/$collectionConfig'
import { GrayMatterParseResult } from '../../../../shared/schemas'
import { useTipc } from './use-tipc'
import { useMatchRoute } from '@tanstack/react-router'

function useCollectionData(): GrayMatterParseResult | undefined {
  const matchRoute = useMatchRoute()
  const params = matchRoute({ to: CollectionRoute.id })

  const { data: currentProject } = useCurrentProject()
  const { client, getCurrentProjectParams } = useTipc()

  const { projectName, projectPath } = getCurrentProjectParams()

  if (!params || !params.menuItem || !params.collectionConfig) {
    return undefined
  }

  const config = currentProject?.indexedCollections[params.menuItem]

  const { data } = client.loadDataFile.useQuery(
    {
      projectPath,
      projectName,
      contentDirPath: config?.folder || '',
      filename: params.collectionConfig
    },
    {
      enabled: Boolean(config?.folder) && Boolean(params.collectionConfig)
    }
  )

  return data
}

export default useCollectionData
