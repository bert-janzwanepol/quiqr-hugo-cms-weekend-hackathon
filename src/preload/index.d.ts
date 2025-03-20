import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    electronNavigation: {
      sendNavigationEvent: (location: {
        pathname: string
        search?: string | object
        previous?: string | null
        isInitial?: boolean
      }) => void
    }
  }
}
