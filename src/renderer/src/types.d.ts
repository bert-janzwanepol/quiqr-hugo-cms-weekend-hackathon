import { Field } from '../../shared/schemas'

export interface FieldProps {
  field: Field
  [key: string]: unknown
}

export type FieldComponent = React.ComponentType<FieldProps>

export type FieldImporter = () => Promise<{ default: FieldComponent }>
