import { createContext, useContext, useState, useEffect } from 'react'
import { client, handlers } from '../client'
import { Register } from '@tanstack/react-router'
import { ValidatedProject } from '../../../shared/types'
import { UseQueryResult } from '@tanstack/react-query'
interface TipcContextType {
  client: typeof client
  paths: {
    userData: string
    homePath: string
    quiqrHome: string
  }
  getCurrentProjectName: () => string
  getCurrentProjectParams: () => {
    projectPath: string
    projectName: string
    enabled: boolean
  }
  openProject: (projectId: string) => void
}

const TipcContext = createContext<TipcContextType | null>(null)

interface TipcProviderProps {
  children: React.ReactNode
  router: Register['router']
}

export function TipcProvider({ children, router }: TipcProviderProps) {
  const [paths, setPaths] = useState<TipcContextType['paths']>({
    userData: '',
    homePath: '',
    quiqrHome: ''
  })

  useEffect(() => {
    const unsubscribeUserData = handlers.setUserdataDirectoryPath.listen((userData) => {
      setPaths((prev) => ({ ...prev, userData }))
    })

    const unsubscribeHome = handlers.setHomeDirectoryPath.listen((homePath) => {
      setPaths((prev) => ({ ...prev, homePath: homePath }))
    })

    const unsubscribeQuiqrHome = handlers.setQuiqrHomeDirectoryPath.listen((quiqrHomePath) => {
      setPaths((prev) => ({ ...prev, quiqrHome: quiqrHomePath }))
    })

    return () => {
      unsubscribeUserData()
      unsubscribeHome()
      unsubscribeQuiqrHome()
    }
  }, [paths.userData, paths.homePath, paths.quiqrHome])

  const getCurrentProjectName = () => {
    try {
      const state = router.state
      if (!state) return ''

      // Check if we're on a project route
      const projectMatch = state.matches.find((match) =>
        match.routeId.includes('/projects/$projectId')
      )

      if (projectMatch && 'projectId' in projectMatch.params) {
        return String(projectMatch.params.projectId)
      }
    } catch (error) {
      console.error('Error accessing router state:', error)
    }

    return ''
  }

  const getCurrentProjectParams = () => {
    const currentProjectName = getCurrentProjectName()
    return {
      projectPath: paths.quiqrHome,
      projectName: currentProjectName,
      enabled: Boolean(paths.quiqrHome) && currentProjectName != null
    }
  }

  const openProject = (projectId: string) => {
    try {
      router.navigate({
        to: '/projects/$projectId',
        params: { projectId }
      })
    } catch (error) {
      console.error('Error navigating to project:', error)
    }
  }

  const value = {
    client,
    paths,
    getCurrentProjectName,
    getCurrentProjectParams,
    openProject
  }

  return <TipcContext.Provider value={value}>{children}</TipcContext.Provider>
}

// TODO: move to lib/hooks so vites hmr works
// eslint-disable-next-line
export function useTipc() {
  const context = useContext(TipcContext)
  if (!context) {
    throw new Error('useTipc must be used within a TipcProvider')
  }
  return context
}

// TODO: move to lib/hooks so hmr works
// eslint-disable-next-line
export function useCurrentProject(): UseQueryResult<ValidatedProject, Error> {
  const { client, getCurrentProjectParams } = useTipc()
  const { projectName, projectPath } = getCurrentProjectParams()

  return client.loadAndValidateConfigs.useQuery(
    { projectPath, projectName },
    { enabled: Boolean(projectPath) && projectName !== '' }
  )
}
