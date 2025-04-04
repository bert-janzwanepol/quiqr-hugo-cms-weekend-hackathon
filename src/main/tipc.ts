import { tipc } from '@egoist/tipc/main'
// TODO: figure out if having fs externalized in the browser is a bad thing
import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import {
  loadSiteConfig,
  loadSinglesConfig,
  loadMenuConfig,
  loadCollectionsConfig,
  createEnhancedMenuConfig,
  validateMenuReferences,
  getMenuItemTitle,
  createIndexedConfig,
  loadDataDirectory,
  listDirectory,
  DirectoryEntry,
  loadConfig
} from '../shared/types/config-loader'
import { MenuConfig, CollectionConfig, SingleConfig } from '../shared/schemas'
import {
  ValidatedProject,
  EnhancedMenuItem,
  IndexedSinglesConfig,
  IndexedCollectionsConfig
} from '../shared/types'
import { BrowserWindow } from 'electron'

const t = tipc.create()

export const router = {
  getActiveProjects: t.procedure.input<{ path: string }>().action(async ({ input }) => {
    if (!input.path) {
      return []
    }

    try {
      // Get all directory names
      const directories = await fs.readdir(input.path, { withFileTypes: true })
      const dirNames = directories
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)

      // Read all config files in parallel
      const projectConfigPromises = dirNames.map(async (dirName) => {
        try {
          const configPath = path.join(input.path, dirName, 'config.json')
          const configContent = await fs.readFile(configPath, 'utf-8')
          const config = JSON.parse(configContent)

          if (config.key !== dirName) {
            console.warn(
              `Warning: Directory name '${dirName}' doesn't match config key '${config.key}'`
            )
          }

          return {
            dirName,
            config,
            isValid: config.key === dirName
          }
        } catch (error) {
          console.error(`Error reading config for directory ${dirName}:`, error)
          return null // Return null for invalid projects
        }
      })

      // Wait for all promises to resolve
      const projectConfigs = await Promise.all(projectConfigPromises)

      // Filter out any null (invalid projects) and return valid projects
      return projectConfigs.filter((project) => project !== null)
    } catch (error) {
      console.error('Error reading projects directory:', error)
      return []
    }
  }),

  listDataDirectory: t.procedure
    .input<{ projectPath: string; projectName: string; contentDirPath: string }>()
    .action(async ({ input }): Promise<DirectoryEntry[]> => {
      try {
        const siteConfig = await loadSiteConfig(
          path.join(input.projectPath, input.projectName, 'config.json')
        )

        const fullPath = path.join(
          input.projectPath,
          input.projectName,
          siteConfig.source.path,
          input.contentDirPath
        )

        const data = await listDirectory(fullPath)

        return data
      } catch (error) {
        console.error('Error loading configs:', error)
        throw error
      }
    }),
  loadDataFile: t.procedure
    .input<{
      projectPath: string
      projectName: string
      contentDirPath: string
      filename: string
    }>()
    .action(async ({ input }): Promise<CollectionConfig['fields']> => {
      try {
        const siteConfig = await loadSiteConfig(
          path.join(input.projectPath, input.projectName, 'config.json')
        )

        const fullPath = path.join(
          input.projectPath,
          input.projectName,
          siteConfig.source.path,
          input.contentDirPath,
          input.filename
        )

        console.log(fullPath)

        const data = await loadConfig<CollectionConfig['fields']>(fullPath)

        return data
      } catch (error) {
        console.error('Error loading configs:', error)
        throw error
      }
    }),
  loadAndValidateDataDirectory: t.procedure
    .input<{ projectPath: string; projectName: string; contentDirPath: string }>()
    .action(async ({ input }): Promise<unknown> => {
      try {
        const siteConfig = await loadSiteConfig(
          path.join(input.projectPath, input.projectName, 'config.json')
        )

        const fullPath = path.join(
          input.projectPath,
          input.projectName,
          siteConfig.source.path,
          input.contentDirPath
        )

        const data = await loadDataDirectory(fullPath)

        return data
      } catch (error) {
        console.error('Error loading configs:', error)
        throw error
      }
    }),

  loadAndValidateConfigs: t.procedure
    .input<{ projectPath: string; projectName: string }>()
    .action(async ({ input }): Promise<ValidatedProject> => {
      try {
        const siteConfig = await loadSiteConfig(
          path.join(input.projectPath, input.projectName, 'config.json')
        )

        const fullProjectPath = path.join(
          input.projectPath,
          input.projectName,
          siteConfig.source.path
        )

        // TODO: file extensions
        // TODO: error handling
        // TODO: config validation
        // menuConfig, singlesConfig and collectionsConfig are regular Quiqr Files
        const menuConfig = await loadMenuConfig(
          path.join(fullProjectPath, 'quiqr/model/includes/menu.yaml')
        )

        const singlesConfig = await loadSinglesConfig(
          path.join(fullProjectPath, 'quiqr/model/includes/singles.yaml')
        )

        const collectionsConfig = await loadCollectionsConfig(
          path.join(fullProjectPath, 'quiqr/model/includes/collections.yaml')
        )

        /**
         * Create indexed configs for faster lookups
         * The singlesConfig and collectionsConfig is structured like [{key: somekey, ... }, {key: someotherkey, ... }]
         * This means that the lookup time for a key is O(N)
         *
         * The indexed configs have O(1) lookup time
         * because they are HashMaps: [key: {...data}, someotherkey: {...data}]
         */
        const indexedSingles = createIndexedConfig<SingleConfig>(singlesConfig)
        const indexedCollections = createIndexedConfig<CollectionConfig>(collectionsConfig)

        /**
         * The flat nature of yaml files means we need to manually
         * create references to singles and collections.
         * We could store the whole referenced object, but just a reference
         * to a file (that might be updated outside of the app) is better.
         */
        const enhancedMenuConfig = createEnhancedMenuConfig(
          menuConfig,
          indexedSingles,
          indexedCollections
        )

        // Validate references between menu items and singles/collections
        //
        const validation = validateMenuReferences(
          enhancedMenuConfig,
          indexedSingles,
          indexedCollections
        )

        return {
          menuConfig,
          enhancedMenuConfig,
          singlesConfig,
          collectionsConfig,
          indexedSingles,
          indexedCollections,
          isValid: validation.valid,
          errors: validation.errors,
          projectName: input.projectName
        }
      } catch (error) {
        console.error('Error loading configs:', error)
        throw error
      }
    }),

  validateConfig: t.procedure
    .input<{
      configType: 'singles' | 'collections' | 'menu'
      data: unknown
    }>()
    .action(async ({ input }) => {
      try {
        if (input.configType === 'menu') {
          // TODO
        } else if (input.configType === 'singles') {
          // TODO
        } else if (input.configType === 'collections') {
          // TODO
        }

        return { valid: true, errors: [] }
      } catch (error) {
        console.error(`Error validating ${input.configType} schema:`, error)
        let errorMessage = ''
        if (error instanceof Error) {
          errorMessage = error.message
        } else {
          errorMessage = String(error)
        }
        return { valid: false, errors: [errorMessage] }
      }
    }),

  getMenuItemTitle: t.procedure
    .input<{
      menuItemKey: string
      indexedSingles: IndexedSinglesConfig
      indexedCollections: IndexedCollectionsConfig
    }>()
    .action(async ({ input }) => {
      try {
        // First determine if the key exists in singles or collections
        let reference: { type: 'single' | 'collection'; key: string } | undefined

        if (input.indexedSingles[input.menuItemKey]) {
          reference = { type: 'single', key: input.menuItemKey }
        } else if (input.indexedCollections[input.menuItemKey]) {
          reference = { type: 'collection', key: input.menuItemKey }
        }

        // a menu item key is basically a foreign key to singles.yaml, collections.yaml or even data.yaml
        const enhancedMenuItem: EnhancedMenuItem = {
          key: input.menuItemKey,
          reference
        }

        // Get title using the enhanced menu item
        const title = getMenuItemTitle(
          enhancedMenuItem,
          input.indexedSingles,
          input.indexedCollections
        )

        return {
          title,
          found: title !== undefined
        }
      } catch (error) {
        console.error('Error getting menu item title:', error)
        return {
          title: undefined,
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }),

  saveConfig: t.procedure
    .input<{
      projectPath: string
      configType: 'singles' | 'collections' | 'menu'
      relativePath: string
      data: SingleConfig[] | CollectionConfig[] | MenuConfig
    }>()
    .action(async ({ input }) => {
      try {
        const siteConfig = await loadSiteConfig(path.join(input.projectPath, 'config.json'))

        const fullProjectPath = path.join(input.projectPath, siteConfig.source.path)
        const configPath = path.join(fullProjectPath, input.relativePath)

        // Save the config
        const ext = path.extname(configPath).toLowerCase()
        let content: string

        if (ext === '.json') {
          content = JSON.stringify(input.data, null, 2)
        } else if (ext === '.yaml' || ext === '.yml') {
          content = yaml.dump(input.data, { lineWidth: -1 })
        } else {
          return {
            success: false,
            errors: [`Unsupported file extension: ${ext}`]
          }
        }

        await fs.writeFile(configPath, content, 'utf-8')

        return {
          success: true
        }
      } catch (error) {
        console.error('Error saving config:', error)
        let errorMessage = ''
        if (error instanceof Error) {
          errorMessage = error.message
        } else {
          errorMessage = String(error)
        }
        return {
          success: false,
          errors: [errorMessage]
        }
      }
    }),

  setElectronTheme: t.procedure
    .input<{ theme: 'light' | 'dark' | 'system' }>()
    .action(async ({ input }) => {
      // TODO: find a better way? This feels illegal
      const mainWindow = BrowserWindow.getAllWindows()[0]

      const isDark = input.theme === 'dark'
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#000' : '#fff',
        symbolColor: isDark ? '#fff' : '#000',
        height: 30
      })
      mainWindow.setBackgroundColor(isDark ? '#1e1e1e' : '#ffffff')
      return true
    })
}

export type Router = typeof router

export type RendererHandlers = {
  getUserAgent: () => string
  setUserdataDirectoryPath: (path: string) => void
  setHomeDirectoryPath: (path: string) => void
  setQuiqrHomeDirectoryPath: (path: string) => void
  updateElectronTheme: (theme: 'light' | 'dark') => void
}
