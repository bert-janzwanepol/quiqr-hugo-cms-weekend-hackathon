import { z } from 'zod'

const baseFieldSchema = z.object({
  key: z.string(),
  type: z.string().optional(),
  title: z.string().optional(),
  multiLine: z.boolean().optional(),
  arrayTitle: z.boolean().optional(),
  hidden: z.boolean().optional()
})

export const singleConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  file: z.string().optional(),
  previewUrl: z.string().optional(),
  _mergePartial: z.string().optional(),
  hidePreviewIcon: z.boolean().optional(),
  hideExternalEditIcon: z.boolean().optional(),
  hideSaveButton: z.boolean().optional(),
  fields: z.array(baseFieldSchema).optional()
})

export const collectionConfigSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  folder: z.string(),
  extension: z.string(),
  dataformat: z.string(),
  itemtitle: z.string(),
  hideIndex: z.boolean().optional(),
  previewUrlBase: z.string().optional(),
  _mergePartial: z.string().optional(),
  sortkey: z.string().optional(),
  hidePreviewIcon: z.boolean().optional(),
  fields: z.array(baseFieldSchema).optional()
})

export const menuItemSchema = z.object({
  key: z.string()
})

export const menuSectionSchema = z.object({
  title: z.string(),
  key: z.string(),
  matchRole: z.string().optional(),
  menuItems: z.array(menuItemSchema)
})

export const menuSchema = z.array(menuSectionSchema)

export const publConfSchema = z.object({
  type: z.string(),
  username: z.string(),
  email: z.string(),
  repository: z.string(),
  branch: z.string(),
  deployPrivateKey: z.string(),
  deployPublicKey: z.string(),
  publishScope: z.string(),
  setGitHubActions: z.boolean(),
  keyPairBusy: z.boolean(),
  overrideBaseURLSwitch: z.boolean(),
  overrideBaseURL: z.string()
})

export const siteConfigSchema = z.object({
  key: z.string(),
  name: z.string(),
  source: z.object({
    type: z.literal('folder'),
    path: z.string()
  }),
  serve: z
    .object({
      key: z.string(),
      config: z.string(),
      hugoHidePreviewSite: z.boolean()
    })
    .optional(),
  build: z
    .object({
      key: z.string(),
      config: z.string()
    })
    .optional(),
  publish: z
    .array(
      z.object({
        key: z.string(),
        config: publConfSchema
      })
    )
    .optional(),
  tags: z.array(z.string()).optional(),
  lastPublish: z.number().optional(),
  publishStatus: z.number().int().min(0).max(8).optional(),
  lastEdit: z.number().optional(),
  transform: z.array(z.unknown()).optional()
})

export type SingleConfig = z.infer<typeof singleConfigSchema>
export type CollectionConfig = z.infer<typeof collectionConfigSchema>
export type MenuItem = z.infer<typeof menuItemSchema>
export type MenuSection = z.infer<typeof menuSectionSchema>
export type MenuConfig = z.infer<typeof menuSchema>
export type PublConf = z.infer<typeof publConfSchema>
export type SiteConfig = z.infer<typeof siteConfigSchema>
