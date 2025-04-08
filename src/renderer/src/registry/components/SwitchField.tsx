import { Switch } from '../../components/ui/switch'
import { FieldRendererProps } from '../FieldRenderer'

function SwitchField({ field, data }: FieldRendererProps) {
  return <Switch defaultChecked={data.data[field.key] || false} />
}

export default SwitchField
