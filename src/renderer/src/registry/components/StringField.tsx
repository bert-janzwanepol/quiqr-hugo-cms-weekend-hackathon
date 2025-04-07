import { Field } from '../../../../shared/schemas'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import useCollectionData from '../../lib/hooks/use-collection-data'

function StringField({ field }: { field: Field }) {
  const config = useCollectionData()

  if ('multiline' in field && field.multiline === true) {
    return <Textarea defaultValue={config?.data[field.key] || ''} />
  }

  return <Input defaultValue={config?.data[field.key] || ''} type="text" />
}

export default StringField
