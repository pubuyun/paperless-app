import { EditorContent, Editor } from '@tiptap/react'
import React, { useRef, useState } from 'react'

import { LinkMenu } from '../menus/LinkMenu'
import { useBlockEditor } from '../../hooks/useBlockEditor'
import '../../styles/index.css'

import { Sidebar } from '../Sidebar'
import ImageBlockMenu from '../../extensions/ImageBlock/components/ImageBlockMenu'
import { ColumnsMenu } from '../../extensions/MultiColumn/menus'
import { TableColumnMenu, TableRowMenu } from '../../extensions/Table/menus'
import { EditorHeader } from './components/EditorHeader'
import { TextMenu } from '../menus/TextMenu'
import { useSidebar } from '../../hooks/useSidebar'
import ContentItemMenu from '../menus/ContentItemMenu/ContentItemMenu'
import MenuBar from '../../components/ui/MenuBar/MenuBar'

export const BlockEditor = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditable, setIsEditable] = useState(true)
  const menuContainerRef = useRef(null)

  const leftSidebar = useSidebar()
  const { editor } = useBlockEditor({
    onTransaction({ editor: currentEditor }: { editor: Editor }) {
      setIsEditable(currentEditor.isEditable)
    },
  })
  if (!editor) {
    return null
  }
  return (
    <div className="flex" ref={menuContainerRef}>
      <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} editor={editor} />
      <div className="relative flex flex-col flex-1 max-h-fit overflow-y-scroll" style={{ maxHeight: 'calc(100vh - 48px)' }}>
        <EditorHeader
          editor={editor}
          isSidebarOpen={leftSidebar.isOpen}  
          toggleSidebar={leftSidebar.toggle}
        />
        <MenuBar editor={editor} />
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <ContentItemMenu editor={editor} isEditable={isEditable}/>
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
    </div>
  )
}

export default BlockEditor
