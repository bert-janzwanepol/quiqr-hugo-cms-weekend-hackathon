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
import matter from 'gray-matter'

export async function loadConfig<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8')
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.json') {
    return JSON.parse(content) as T
  } else if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content) as T
  } else if (ext === '.toml') {
    return toml.parse(content) as T
  } else if (ext === '.md') {
    const markdown = matter(content)
    return markdown as T
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
/**
 * Interface for directory entry with metadata
 */
export interface DirectoryEntry {
  name: string
  path: string
  isDirectory: boolean
  children?: DirectoryEntry[]
}

/**
 * Interface for markdown content with metadata
 */
export interface MarkdownContent<T = unknown> {
  content: string
  metadata: T
  path: string
}

/**
 * Lists directory contents recursively
 *
 * @param dirPath - Path to directory
 * @param recursive - Whether to recursively list subdirectories
 * @returns Promise with array of DirectoryEntry objects
 */
export async function listDirectory(dirPath: string, recursive = true): Promise<DirectoryEntry[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const result: DirectoryEntry[] = []

    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name)
      const dirEntry: DirectoryEntry = {
        name: entry.name,
        path: entryPath,
        isDirectory: entry.isDirectory()
      }

      if (entry.isDirectory() && recursive) {
        dirEntry.children = await listDirectory(entryPath, recursive)
      }

      result.push(dirEntry)
    }

    return result
  } catch (error) {
    throw new Error(
      `Failed to list directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Loads markdown file content and frontmatter metadata using gray-matter
 *
 * @param filePath - Path to markdown file
 * @returns Promise with markdown content and metadata
 */
export async function loadMarkdownFile<T = unknown>(filePath: string): Promise<MarkdownContent<T>> {
  try {
    const content = await fs.readFile(filePath, 'utf8')

    // Parse frontmatter with gray-matter
    const { data, content: markdownContent } = matter(content)

    return {
      content: markdownContent,
      metadata: data as T,
      path: filePath
    }
  } catch (error) {
    throw new Error(
      `Failed to load markdown file ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Loads data from a directory structure where each subdirectory has an index.md file
 *
 * @param dirPath - Path to the parent directory
 * @returns Promise with array of MarkdownContent from each subdirectory's index.md
 */
export async function loadDataDirectory<T = unknown>(
  dirPath: string
): Promise<MarkdownContent<T>[]> {
  // Get all subdirectories
  const entries = await listDirectory(dirPath, false)
  const subdirectories = entries.filter((entry) => entry.isDirectory)

  console.log(subdirectories)

  // Load index.md from each subdirectory
  const results: MarkdownContent<T>[] = []

  for (const subdir of subdirectories) {
    const indexPath = path.join(subdir.path, 'index.md')

    try {
      // Check if index.md exists
      await fs.access(indexPath)

      // Load the markdown file
      const markdownContent = await loadMarkdownFile<T>(indexPath)
      results.push(markdownContent)
    } catch (error) {
      // Skip directories without index.md
      console.warn(`No index.md found in ${subdir.path}`)
      console.error(error)
    }
  }

  return results
}

/**
 * Loads a specific markdown file based on a path structure
 *
 * @param basePath - Base directory path
 * @param subPath - Subpath to locate the specific markdown file
 * @returns Promise with MarkdownContent
 */
export async function loadMarkdownByPath<T = unknown>(
  basePath: string,
  subPath: string
): Promise<MarkdownContent<T>> {
  // Normalize the subpath to remove leading/trailing slashes
  const normalizedSubPath = subPath.replace(/^\/+|\/+$/g, '')

  // Determine if we're looking for an index.md or a specific markdown file
  let fullPath: string

  if (normalizedSubPath.endsWith('.md')) {
    // Direct path to a markdown file
    fullPath = path.join(basePath, normalizedSubPath)
  } else {
    // Path to a directory, look for index.md
    fullPath = path.join(basePath, normalizedSubPath, 'index.md')
  }

  try {
    return await loadMarkdownFile<T>(fullPath)
  } catch (error) {
    throw new Error(
      `Failed to load markdown at path ${subPath}: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

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
