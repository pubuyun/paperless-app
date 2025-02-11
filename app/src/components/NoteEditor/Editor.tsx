import { EditorProvider, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const extensions = [StarterKit]
interface TiptapProps { 
  content: string;
}
const Tiptap:React.FC<TiptapProps> = ({content}) => {
  return (
    <EditorProvider extensions={extensions} content={content}>
      <FloatingMenu editor={null}>Type / to browse options</FloatingMenu>
      <BubbleMenu editor={null}>bubble menu</BubbleMenu>
    </EditorProvider>
  )
}

export default Tiptap
