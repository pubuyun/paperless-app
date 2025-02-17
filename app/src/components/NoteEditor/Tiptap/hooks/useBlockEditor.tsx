import { useEditor } from '@tiptap/react'
import type { EditorOptions } from '@tiptap/core'

import { ExtensionKit } from '../extensions/extension-kit'
const initialContent = ''

export const useBlockEditor = ({
  ...editorOptions
}: Partial<Omit<EditorOptions, 'extensions'>>) => {

  const editor = useEditor(
    {
      ...editorOptions,
      immediatelyRender: true, 
      shouldRerenderOnTransaction: false,
      autofocus: true,
      onCreate: ctx => {
        if (ctx.editor.isEmpty) {
          ctx.editor.commands.setContent(initialContent)
          ctx.editor.commands.focus('start', { scrollIntoView: true })
        }
      },
      extensions: [
        ...ExtensionKit({})
      ],
      editorProps: {
        attributes: {
          autocomplete: 'on',
          autocorrect: 'on',
          autocapitalize: 'off',
        },
      },
    }
  )

  return { editor }
}
