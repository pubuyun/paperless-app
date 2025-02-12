import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'

import StarterKit from '@tiptap/starter-kit'
import '../../themes/editor.scss'
import { Color } from '@tiptap/extension-color'
// editor.chain().focus().setColor('#958DF1').run()
import TextStyle from '@tiptap/extension-text-style'

import MenuBar from './Tiptap/MenuBar'

interface TiptapProps {
  content: string
}

export default function Tiptap({content=''} : TiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.configure({
      }),
      Color,
      TextStyle,
    ],
  })

  return (
    <div className="editor">
      {editor && <MenuBar editor={editor} />}
      <EditorContent className="editor__content" editor={editor} content={content} />
      <div className="editor__footer">
        {editor?.storage.characterCount.characters()} characters  {editor?.storage.characterCount.words()} words
      </div>
    </div>
  )
}
