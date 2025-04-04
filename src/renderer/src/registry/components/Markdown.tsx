import '@mdxeditor/editor/style.css'
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin } from '@mdxeditor/editor'

function Markdown() {
  return (
    <MDXEditor
      markdown="Hello world"
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

export default Markdown
