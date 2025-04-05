import { useState, useEffect } from 'react'
import { client, handlers } from '../client'
import { Register } from '@tanstack/react-router'
import { TipcContext, TipcContextType } from '../lib/hooks/use-tipc'

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
