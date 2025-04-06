import '@mdxeditor/editor/style.css'
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin } from '@mdxeditor/editor'
import { Field } from '../../../../shared/schemas'
import useCollectionData from '../../lib/hooks/use-collection-data'

function MarkdownField({ field }: { field: Field }) {
  const config = useCollectionData()

  // same early returns

  return (
    <MDXEditor
      readOnly={config?.data[field.key]}
      markdown={config?.data[field.key] || ''}
      plugins={[
        toolbarPlugin({
          toolbarClassName: 'my-classname',
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
            </>
          )
        })
      ]}
    />
  )
}

export default MarkdownField
