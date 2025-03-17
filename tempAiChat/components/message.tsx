import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Typography } from "@mui/material";
import { Message as MessageType } from '@/types/message';
import { MessageContent } from './message-content';

export const Message = ({ message }: { message: MessageType }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: message.role === "user" ? "flex-end" : "flex-start",
      mb: 2,
    }}
  >
    <Box
      sx={{
        position: "relative",
        maxWidth: "75%",
        p: 2,
        borderRadius: 2,
        bgcolor: message.role === "user" ? "primary.main" : "background.paper",
        color: message.role === "user" ? "primary.contrastText" : "text.primary",
        "&:hover .message-footer": { opacity: 1 },
      }}
    >
      {/* <MessageContent message={message} /> */}
      {/* <Typography variant="body1" sx={{ 
          color: "inherit",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap"
        }}>
        {message.content}
      </Typography>
       */}
      <MessageContent message={message} />
      {message.role === "assistant" && (
        <Box
          className="message-footer"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            bgcolor: "background.paper",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            opacity: 0,
            transition: "opacity 0.3s",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ typography: "caption", color: "text.secondary" }}>
            Generated with {message.model}
          </Box>
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => navigator.clipboard.writeText(message.content)}
          >
            Copy
          </Button>
        </Box>
      )}
    </Box>
  </Box>
);