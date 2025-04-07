function ConfigViewer({ config }: { config: unknown }) {
  return (
    <pre className="select-all whitespace-pre-wrap break-words">
      {JSON.stringify(config, null, 2)}
    </pre>
  )
}

export default ConfigViewer
