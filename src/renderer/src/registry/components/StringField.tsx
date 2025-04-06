import { Field } from '../../../../shared/schemas'
import useCollectionData from '../../lib/hooks/use-collection-data'

function StringField({ field }: { field: Field }) {
  const config = useCollectionData()

  if (!config || !config.data) {
    return <div className="text-red-500">no data found for key {field.key}</div>
  }

  if (config.data[field.key] === undefined) {
    return <div className="text-red-500">{`field ${field.key} is undefined`}</div>
  }

  if (config.data[field.key] === '') {
    return <div className="text-red-500">{`field ${field.key} is an empty string`}</div>
  }

  return <div>{config.data[field.key]} </div>
}

export default StringField
