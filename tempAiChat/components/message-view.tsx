import Box from "@mui/material/Box";
import { Message as MessageType } from '@/types/message';
import { Message } from './message';

interface MessageViewProps {
  messages: MessageType[];
  isTyping: boolean;
}

export const MessageView = ({ messages, isTyping }: MessageViewProps) => (
  <Box sx={{ maxWidth: "48rem", mx: "auto", my: 2 }}>
    {messages.map((message) => (
      <Message key={message.id} message={message} />
    ))}
    {isTyping && (
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>...</Box>
      </Box>
    )}
  </Box>
);