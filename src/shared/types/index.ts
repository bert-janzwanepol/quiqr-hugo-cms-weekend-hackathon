import { CollectionConfig, MenuConfig, SingleConfig } from '../schemas'

export interface IndexedSinglesConfig {
  [key: string]: {
    title?: string
    file?: string
    previewUrl?: string
    _mergePartial?: string
    hidePreviewIcon?: boolean
    hideExternalEditIcon?: boolean
    hideSaveButton?: boolean
    fields?: Array<{
      key: string
      type?: string
      title?: string
      multiLine?: boolean
      arrayTitle?: boolean
      hidden?: boolean
    }>
  }
}

export interface IndexedMenuConfig {
  [key: string]: Omit<EnhancedMenuConfig, 'key'>
}

export interface IndexedCollectionsConfig {
  [key: string]: {
    title?: string
    folder: string
    extension: string
    dataformat: string
    itemtitle: string
    hideIndex?: boolean
    previewUrlBase?: string
    _mergePartial?: string
    sortkey?: string
    hidePreviewIcon?: boolean
    fields?: Array<{
      key: string
      type?: string
      title?: string
      multiLine?: boolean
      arrayTitle?: boolean
      hidden?: boolean
    }>
  }
}

export interface ValidatedProject {
  menuConfig: MenuConfig
  enhancedMenuConfig: EnhancedMenuConfig
  singlesConfig: SingleConfig[]
  collectionsConfig: CollectionConfig[]
  indexedSingles: IndexedSinglesConfig
  indexedCollections: IndexedCollectionsConfig
  isValid: boolean
  errors: MissingMenuItemError[]
  projectName: string
}

/**
 * The Quiqr menu configs only store the reference name,
 * not the type they reference.
 *
 * When a config file gets read, we check if a reference is either
 * a single or a collection
 *
 * If no reference is found, the reference field is omitted
 */
export interface EnhancedMenuItem {
  key: string
  reference?: {
    type: 'single' | 'collection'
    key: string
  }
}

export interface EnhancedMenuSection {
  title: string
  key?: string
  matchRole?: string
  menuItems: EnhancedMenuItem[]
}

export type EnhancedMenuConfig = EnhancedMenuSection[]

export type MissingMenuItemError = {
  [key: string]: string
}

export interface ValidationResult {
  valid: boolean
  errors: MissingMenuItemError[]
}
