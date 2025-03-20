export interface BaseField {
  key: string
  type?: string
  title?: string
  multiLine?: boolean
  arrayTitle?: boolean
  hidden?: boolean
}

export interface StringField extends BaseField {
  type: 'string'
}

export interface MarkdownField extends BaseField {
  type: 'markdown'
}

export interface HiddenField extends BaseField {
  type: 'hidden'
}

export interface DateField extends BaseField {
  type: 'date'
  default?: string
}

export interface SelectField extends BaseField {
  type: 'select'
  multiple?: boolean
  options: string[]
}

export interface ChipsField extends BaseField {
  type: 'chips'
}

export interface ImageSelectField extends BaseField {
  type: 'image-select'
  path: string
  buttonTitle?: string
}

export interface BundleManagerField extends BaseField {
  type: 'bundle-manager'
  path: string
  addButtonLocationTop?: boolean
  extensions?: string[]
  fields?: BaseField[]
}

export interface AccordionField extends BaseField {
  type: 'accordion'
  fields: BaseField[]
}

export interface BundleImageThumbnailField extends BaseField {
  type: 'bundle-image-thumbnail'
}

export type Field =
  | StringField
  | MarkdownField
  | HiddenField
  | DateField
  | SelectField
  | ChipsField
  | ImageSelectField
  | BundleManagerField
  | AccordionField
  | BundleImageThumbnailField
  | BaseField // For any other field types not explicitly defined

export interface BaseConfig {
  key: string
  title?: string
  fields?: Field[]
}
