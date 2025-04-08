import React, { Suspense, lazy, ComponentType } from 'react'
import { fieldRegistry } from './FieldRegistry'
import { Field, GrayMatterParseResult } from '../../../shared/schemas'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorField from './components/ErrorField'

export interface FieldRendererProps {
  field: Field
  data: GrayMatterParseResult
  fallback?: React.ReactNode
}

/**
 * Dynamically loads a field component based on its type
 */
const loadComponent = (
  type: string
): ComponentType<{ field: Field; data: GrayMatterParseResult | undefined }> => {
  const importer = fieldRegistry.getComponent(type)
  return lazy(importer)
}

/**
 * Renders a field component based on its type
 */
function FieldRenderer({
  field,
  data,
  fallback = <div>Loading field...</div>,
  ...props
}: FieldRendererProps): JSX.Element {
  const FieldComponent = loadComponent(field.type)

  return (
    <ErrorBoundary fallbackRender={ErrorField}>
      <Suspense fallback={fallback}>
        <FieldComponent field={field} data={data} {...props} />
      </Suspense>
    </ErrorBoundary>
  )
}

export default FieldRenderer
