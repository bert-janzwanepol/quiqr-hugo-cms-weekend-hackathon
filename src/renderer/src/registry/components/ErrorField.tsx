import { FallbackProps } from 'react-error-boundary'
import ConfigViewer from '../../components/config-viewer'

function ErrorField({ error }: FallbackProps) {
  return (
    <div className="text-red-500">
      <ConfigViewer config={error} />
    </div>
  )
}

export default ErrorField
