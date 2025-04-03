import { BaseConfig, Field } from '../schemas'

export interface SingleConfig extends BaseConfig {
  file?: string
  previewUrl?: string
  _mergePartial?: string
  hidePreviewIcon?: boolean
  hideExternalEditIcon?: boolean
  hideSaveButton?: boolean
}

export interface BundleConfig extends SingleConfig {
  fields: Field[]
}

export interface MediaConfig extends BundleConfig {
  hideExternalEditIcon: boolean
  hidePreviewIcon: boolean
  hideSaveButton?: boolean
  file: string
}

export interface PageConfig extends SingleConfig {
  previewUrl: string // Pages must have preview URLs
  _mergePartial: string // Pages usually use _mergePartials like composit_page
}

export type SinglesConfig = SingleConfig[]
