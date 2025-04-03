import React, { Suspense, lazy, ComponentType } from 'react'
import { fieldRegistry } from './FieldRegistry'
import { Field } from '../../../shared/schemas'

interface FieldRendererProps {
  field: Field
  fallback?: React.ReactNode
}

/**
 * Dynamically loads a field component based on its type
 */
const loadComponent = (type: string): ComponentType<{ field: Field }> => {
  const importer = fieldRegistry.getComponent(type)
  return lazy(importer)
}

/**
 * Renders a field component based on its type
 */
function FieldRenderer({
  field,
  fallback = <div>Loading field...</div>,
  ...props
}: FieldRendererProps): JSX.Element {
  const FieldComponent = loadComponent(field.type)

  return (
    <Suspense fallback={fallback}>
      <FieldComponent field={field} {...props} />
    </Suspense>
  )
}

export default FieldRenderer
