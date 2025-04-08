import '@mdxeditor/editor/style.css'
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  frontmatterPlugin,
  InsertFrontmatter,
  headingsPlugin,
  MDXEditorMethods,
  CreateLink
} from '@mdxeditor/editor'
import { FieldRendererProps } from '../FieldRenderer'
import { useEffect, useRef } from 'react'

function MarkdownField({ field, data }: FieldRendererProps) {
  const editorRef = useRef<MDXEditorMethods>(null)

  useEffect(() => {
    console.log(data.content)
    editorRef.current?.setMarkdown(data.content)
  }, [data.content])
  return (
    <MDXEditor
      ref={editorRef}
      markdown={data.data[field.key] || data.content}
      plugins={[
        frontmatterPlugin(),
        headingsPlugin(),
        toolbarPlugin({
          toolbarClassName: 'my-classname',
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <InsertFrontmatter />
              <CreateLink />
            </>
          )
        })
      ]}
    />
  )
}

export default MarkdownField
