import { BaseConfig } from './config-base'

export interface CollectionConfig extends BaseConfig {
  folder: string
  extension: string
  dataformat: string
  itemtitle: string
  hideIndex?: boolean
  previewUrlBase?: string
  _mergePartial?: string
  sortkey?: string
  hidePreviewIcon?: boolean
}

export interface ContentCollectionConfig extends CollectionConfig {
  previewUrlBase: string
  _mergePartial?: string
}

export interface DataCollectionConfig extends CollectionConfig {
  hidePreviewIcon?: boolean
}

export function isContentCollection(config: CollectionConfig): config is ContentCollectionConfig {
  return !!config.previewUrlBase
}

export function isDataCollection(config: CollectionConfig): config is DataCollectionConfig {
  return !config.previewUrlBase && config.folder.startsWith('data/')
}

export type CollectionsConfig = CollectionConfig[]
