import { BlockEditor } from './components/BlockEditor'
import '../../../themes/editor.scss'
import './global.css'
// editor.chain().focus().setColor('#958DF1').run()

interface TiptapProps {
  content: string
}

export default function Tiptap({content=''} : TiptapProps) {
  return (
    <BlockEditor />
  )
}
