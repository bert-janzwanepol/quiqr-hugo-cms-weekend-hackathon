import { Field } from '../../../../shared/schemas'

function NotFound({ field }: { field: Field }) {
  return (
    <div className="text-red-600">
      Fieldtype <span className="font-bold">{field.type}</span> with key{' '}
      <span className="font-bold">{field.key}</span> not found.
    </div>
  )
}

export default NotFound
