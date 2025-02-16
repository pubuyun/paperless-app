'use client'

import { Icon } from '../../../components/ui/Icon'
import { Toolbar } from '../../../components/ui/Toolbar'

import { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { useCallback } from 'react'

export type EditorHeaderProps = {
  isSidebarOpen?: boolean
  toggleSidebar?: () => void
  editor: Editor
}

export const EditorHeader = ({ editor, isSidebarOpen, toggleSidebar }: EditorHeaderProps) => {
  const { characters, words } = useEditorState({
    editor,
    selector: (ctx): { characters: number; words: number } => {
      const { characters, words } = ctx.editor?.storage.characterCount || { characters: () => 0, words: () => 0 }
      return { characters: characters(), words: words() }
    },
  })

  const toggleEditable = useCallback(() => {
    editor.setOptions({ editable: !editor.isEditable })
    editor.view.dispatch(editor.view.state.tr)
  }, [editor])

  return (
    <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-gray-200 border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
      <div className="flex flex-row gap-x-1.5 items-center">
        <div className="flex items-center gap-x-1.5">
          <Toolbar.Button
            tooltip={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            onClick={toggleSidebar}
            active={isSidebarOpen}
            className={isSidebarOpen ? 'bg-transparent' : ''}
          >
            <Icon name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'} />
          </Toolbar.Button>
          <Toolbar.Button tooltip={editor.isEditable ? 'Disable editing' : 'Enable editing'} onClick={toggleEditable}>
            <Icon name={editor.isEditable ? 'PenOff' : 'Pen'} />
          </Toolbar.Button>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        {words} words, {characters} characters
      </div>
    </div>
  )
}
