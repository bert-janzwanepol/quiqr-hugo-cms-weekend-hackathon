import { useEffect } from 'react'
import { Field } from '../../../../shared/schemas'

function StringField({ field }: { field: Field }) {
  return <div>{field.title}</div>
}

export default StringField
