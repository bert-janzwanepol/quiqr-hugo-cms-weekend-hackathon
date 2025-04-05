import { createContext, useContext } from 'react'
import { client } from '../../client'

export interface TipcContextType {
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

export const TipcContext = createContext<TipcContextType | null>(null)

export function useTipc() {
  const context = useContext(TipcContext)
  if (!context) {
    throw new Error('useTipc must be used within a TipcProvider')
  }
  return context
}
