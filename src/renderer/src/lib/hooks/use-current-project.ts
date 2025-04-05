import { ValidatedProject } from '../../../../shared/types'
import { useTipc } from './use-tipc'
import { UseQueryResult } from '@tanstack/react-query'

export function useCurrentProject(): UseQueryResult<ValidatedProject, Error> {
  const { client, getCurrentProjectParams } = useTipc()
  const { projectName, projectPath } = getCurrentProjectParams()

  return client.loadAndValidateConfigs.useQuery(
    { projectPath, projectName },
    { enabled: Boolean(projectPath) && projectName !== '' }
  )
}
