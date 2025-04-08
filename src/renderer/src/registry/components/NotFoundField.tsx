import { FieldRendererProps } from '../FieldRenderer'

function NotFoundField({ field }: FieldRendererProps) {
  return (
    <div className="text-red-600">
      Fieldtype <span className="font-bold">{field.type}</span> with key{' '}
      <span className="font-bold">{field.key}</span> not found.
    </div>
  )
}

export default NotFoundField
