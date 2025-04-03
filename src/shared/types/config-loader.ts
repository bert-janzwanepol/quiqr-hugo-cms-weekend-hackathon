// TODO: figure out if having fs externalized in the browser is a bad thing
import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import toml from 'toml'
import { MenuConfig, SiteConfig, SingleConfig, CollectionConfig } from '../schemas'
import {
  IndexedSinglesConfig,
  IndexedCollectionsConfig,
  EnhancedMenuConfig,
  EnhancedMenuItem,
  MissingMenuItemError,
  IndexedMenuConfig
} from '../types'
import { merge, keyBy } from 'lodash'

export async function loadConfig<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8')
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.json') {
    return JSON.parse(content) as T
  } else if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content) as T
  } else if (ext === '.toml') {
    return toml.parse(content) as T
  } else {
    throw new Error(`Unsupported file extension: ${ext}`)
  }
}

/**
 *
 * @param filePath string the full filepath to the config, for example:
 *                 /home/username/Quiqr/sites/{sitename}/config.json
 * @returns Promise<SiteConfig>
 *
 */
export async function loadSiteConfig(filePath: string): Promise<SiteConfig> {
  return loadConfig<SiteConfig>(filePath)
}

export async function loadMenuConfig(filePath: string): Promise<MenuConfig> {
  return loadConfig<MenuConfig>(filePath)
}

export async function loadSinglesConfig(filePath: string): Promise<SingleConfig[]> {
  const baseConfig = await loadConfig<SingleConfig[]>(filePath)

  // Process each config that needs partial merging
  const result = await Promise.all(
    baseConfig.map(async (config) => {
      if (config._mergePartial) {
        const partialPath = getPartialPathFromIncludesPath(filePath, config._mergePartial)

        // TODO: track circular dependencies
        // Once we track these, we can replace loadConfig with loadSinglesConfig
        // This allows us to have have nested _mergePartials
        const partialConfig = await loadConfig<Partial<SingleConfig>>(partialPath)

        return mergePartialConfig(config, partialConfig)
      }

      // If the config does not have _mergePartial defined, just return the config
      return config
    })
  )

  return result
}

export async function loadCollectionsConfig(filePath: string): Promise<CollectionConfig[]> {
  const baseConfig = await loadConfig<CollectionConfig[]>(filePath)

  const result = await Promise.all(
    baseConfig.map(async (config) => {
      if (config._mergePartial) {
        const partialPath = getPartialPathFromIncludesPath(filePath, config._mergePartial)

        try {
          const partialConfig = await loadConfig<CollectionConfig>(partialPath)
          return mergePartialConfig(config, partialConfig)
        } catch (error) {
          console.error(`Error loading partial config at ${partialPath}:`, error)
          return config
        }
      }

      return config
    })
  )

  return result
}

export async function loadPartialConfig(
  filePath: string
): Promise<CollectionConfig[] | SingleConfig[]> {
  return loadConfig<CollectionConfig[] | SingleConfig[]>(filePath)
}

// export async function loadDataConfig<T>(filepath: string) {
//   // TODO:
//   // List the directory content
//   // Every directory
// }

export function mergePartialConfig(
  baseConfig: SingleConfig,
  partialConfig: Partial<SingleConfig>
): SingleConfig

export function mergePartialConfig(
  baseConfig: CollectionConfig,
  partialConfig: Partial<CollectionConfig>
): CollectionConfig

export function mergePartialConfig(
  baseConfig: SingleConfig[],
  partialConfig: Partial<SingleConfig[]>
): SingleConfig[]

export function mergePartialConfig(
  baseConfig: CollectionConfig[],
  partialConfig: Partial<CollectionConfig[]>
): CollectionConfig[]

export function mergePartialConfig(
  baseConfig: SingleConfig | CollectionConfig | SingleConfig[] | CollectionConfig[],
  partialConfig: unknown
): SingleConfig | CollectionConfig | SingleConfig[] | CollectionConfig[] {
  // Handle array types
  if (Array.isArray(baseConfig)) {
    return baseConfig.map((item) => {
      if (Array.isArray(partialConfig)) {
        const matchingPartial = partialConfig.find((p) => p && p.key === item.key)
        return item._mergePartial ? mergeConfigItem(item, matchingPartial || {}) : item
      } else {
        return item._mergePartial ? mergeConfigItem(item, partialConfig || {}) : item
      }
    }) as SingleConfig[] | CollectionConfig[]
  }

  if (baseConfig._mergePartial) {
    return mergeConfigItem(baseConfig, partialConfig || {})
  }

  return baseConfig
}

function mergeConfigItem<T extends { key: string; [key: string]: unknown }>(
  baseItem: T,
  partialItem: unknown
): T {
  return merge({}, partialItem, baseItem)
}

export function createIndexedConfig<T extends { key: string }>(
  items: T[]
): { [K in T['key']]: Omit<T, 'key'> } {
  return keyBy(items, 'key')
}

/**
 * @deprecated  already deprecated
 *              use the generic @see createIndexedConfig instead
 */
export function createIndexedSinglesConfig(singles: SingleConfig[]): IndexedSinglesConfig {
  return keyBy(singles, 'key')
}

/**
 * @deprecated  already deprecated
 *              use the generic @see createIndexedConfig instead
 */
export function createIndexedCollectionsConfig(
  collections: CollectionConfig[]
): IndexedCollectionsConfig {
  return keyBy(collections, 'key')
}

export function createIndexedMenuConfig(menus: MenuConfig): IndexedMenuConfig {
  // Filter out sections without keys, then index them
  return keyBy(
    menus.filter((section) => section.key !== undefined),
    'key'
  )
}

export function createEnhancedMenuConfig(
  menu: MenuConfig,
  indexedSingles: IndexedSinglesConfig,
  indexedCollections: IndexedCollectionsConfig
): EnhancedMenuConfig {
  return menu.map((section) => {
    return {
      ...section,
      menuItems: section.menuItems.map((item) => {
        // Determine the reference type based on where the key exists
        let referenceType: 'single' | 'collection' | null = null

        if (indexedSingles[item.key]) {
          referenceType = 'single'
        } else if (indexedCollections[item.key]) {
          referenceType = 'collection'
        }

        // Create an enhanced menu item with a reference
        const enhancedItem: EnhancedMenuItem = {
          key: item.key
        }

        // Add reference if the type was determined
        if (referenceType) {
          enhancedItem.reference = {
            type: referenceType,
            key: item.key
          }
        }

        return enhancedItem
      })
    }
  })
}

// TODO: narrow down return types to [K in T['key']]
export function validateMenuReferences(
  menu: EnhancedMenuConfig,
  indexedSingles: IndexedSinglesConfig,
  indexedCollections: IndexedCollectionsConfig
): { valid: boolean; errors: MissingMenuItemError[] } {
  const errors: MissingMenuItemError[] = []

  menu.forEach((section) => {
    section.menuItems.forEach((item) => {
      // Skip items without references
      if (!item.reference) {
        errors[item.key] =
          `Menu item "${item.key}" in section "${section.title}" does not match any single or collection`
        return
      }

      const { type, key } = item.reference

      if (type === 'single' && !indexedSingles[key]) {
        errors[item.key] =
          `Menu item "${item.key}" in section "${section.title}" references non-existent single with key "${key}"`
      } else if (type === 'collection' && !indexedCollections[key]) {
        errors[item.key] =
          `Menu item "${item.key}" in section "${section.title}" references non-existent collection with key "${key}"`
      }
    })
  })

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

export function getMenuItemTitle(
  menuItem: EnhancedMenuItem,
  indexedSingles: IndexedSinglesConfig,
  indexedCollections: IndexedCollectionsConfig
): string | undefined {
  if (menuItem.reference) {
    const { type, key } = menuItem.reference

    if (type === 'single') {
      return indexedSingles[key]?.title
    }

    if (type === 'collection') {
      return indexedCollections[key]?.title
    }

    // TODO handle data files in /data

    return undefined
  }

  return indexedSingles[menuItem.key]?.title || indexedCollections[menuItem.key]?.title
}

// TODO file extensions
export function getPartialPathFromIncludesPath(filePath: string, partialName: string) {
  return filePath
    .replace('includes', 'partials')
    .replace('singles', partialName)
    .replace('collections', partialName)
}
