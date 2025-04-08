import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { FieldRendererProps } from '../FieldRenderer'

function StringField({ field, data }: FieldRendererProps) {
  if ('multiline' in field && field.multiline === true) {
    return <Textarea defaultValue={data.data[field.key] || ''} />
  }

  return <Input defaultValue={data.data[field.key] || ''} type="text" />
}

export default StringField
