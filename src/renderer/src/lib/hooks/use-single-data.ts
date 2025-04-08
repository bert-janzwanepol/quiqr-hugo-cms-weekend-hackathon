import { Route as SingleRoute } from '@/routes/projects/$projectId/$menuSection/$menuItem/index'

import { GrayMatterParseResult } from '../../../../shared/schemas'
import { useTipc } from './use-tipc'
import { useMatchRoute } from '@tanstack/react-router'

function removeTrailingSlash(path: string): string {
  if (!path) {
    return ''
  }
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function useSingleData({ filename }: { filename: string }): GrayMatterParseResult | undefined {
  const matchRoute = useMatchRoute()
  const params = matchRoute({ to: removeTrailingSlash(SingleRoute.id) })

  const { client, getCurrentProjectParams } = useTipc()

  const { projectName, projectPath } = getCurrentProjectParams()

  if (!params || !('menuItem' in params)) {
    return undefined
  }

  // TODO: files other than .md
  const { data } = client.loadDataFile.useQuery(
    {
      projectPath,
      projectName,
      contentDirPath: '',
      filename: filename || ''
    },
    {
      enabled: Boolean(filename)
    }
  )

  return data
}

export default useSingleData
