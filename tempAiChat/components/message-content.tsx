import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
// import '@/assets/katex.min.css'
import { Message } from '@/types/message'

export const MessageContent = ({ message }: { message: Message }) => (
  message.role === "user" ? message.content : (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]} 
      components={{
        code({ node, inline, className, children, ...props }) {
          if (!children) return null; // Add null check
          
    //     //   const match = /language-(\w+)/.exec(className || '')
          
    //     //   if (inline) {
    //     //     return (
    //     //       <code className="bg-gray-200 rounded-sm px-1" {...props}>
    //     //         {String(children).replace(/\n$/, '')}
    //     //       </code>
    //     //     );
    //     //   }

          return (
            <pre className="rounded-md bg-gray-800 p-4">
              <code className={`${className} ${match ? `language-${match[1]}` : ''}`} {...props}>
                {String(children)}
              </code>
            </pre>
          );
        }
      }}
      source={message.content}
    >
    </ReactMarkdown>
  )
)
