"use client";

import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Sidebar } from "@/components/sidebar";
import { ModelSelector } from "@/components/model-selector";
import { FAQ } from "@/components/faq";
import { Feedback } from "@/components/feedback";
import { UserProfile } from "@/components/user-profile";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import * as prismStyles from 'react-syntax-highlighter/dist/esm/styles/prism'

//todo:
// make it look better
// dont allow sending another while other message from the same chatbox is processing, backend or here?idk
// make hover part display below the metadata stuff not on top of message
// network and process receive stuff faster look at other

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  model?: string;
}

// preset convos for later faq section
//ermemrermermermemrermermermer
const randomConversation = [
  // { id: 1, role: "user", content: "Hi mom" },
  // {
  //   id: 2,
  //   role: "assistant",
  //   content: "qwerty",
  //   model: "GPT-3.5",
  // },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]); //useState(randomConversation)
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("chat");
  const [mode, setMode] = useState<"light" | "dark">("light");

  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini"); // default starting model
  const [isProcessing, setIsProcessing] = useState(false);  // chat is processing

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const currentTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: "#2acbb6",
          },
          mode,
        },
      }),
    [mode]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleModelChange = (model: string) => {
    console.log("Model changed to:", model); // debugging
    setSelectedModel(model);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;  // Add isProcessing check

    setIsProcessing(true);  // Set processing state
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setIsTyping(true);
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const requestBody = {
        messages: [...messages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
        model: selectedModel, //check this
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // check this 
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "",
          model: selectedModel,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        const contentLines = lines
          .filter((line) => line.startsWith("data: "))
          .map((line) => {
            try {
              // parse json encoded data
              return JSON.parse(line.slice(6));
            } catch {
              return line.slice(6);
            }
          });

        assistantMessage += contentLines.join("");
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1].content = assistantMessage;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, there was an error processing your request.",
          model: "System",
        },
      ]);
    } finally {
      setIsTyping(false);
      setIsProcessing(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderContent = () => {
    switch (currentView) {
      case "faq":
        return <FAQ />;
      case "feedback":
        return <Feedback />;
      case "profile":
        return <UserProfile />;
      default:
        return (
          <Box sx={{ maxWidth: "48rem", mx: "auto", my: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.role === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    maxWidth: "75%",
                    p: 2,
                    borderRadius: 2,
                    bgcolor:
                      message.role === "user"
                        ? "primary.main"
                        : "background.paper",
                    color:
                      message.role === "user"
                        ? "primary.contrastText"
                        : "text.primary",
                    "&:hover .message-footer": {
                      opacity: 1,
                    },
                  }}
                >
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex as any]}
                      components={{
                        code({node, inline, className, children, ...props}) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={prismStyles.vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
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
                      <Box
                        sx={{ typography: "caption", color: "text.secondary" }}
                      >
                        Generated with {message.model}
                      </Box>
                      <Button
                        size="small"
                        startIcon={<ContentCopyIcon />}
                        onClick={() => copyToClipboard(message.content)}
                      >
                        Copy
                      </Button>  
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box
                sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}
              >
                <Box
                  sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}
                >
                  ...
                </Box>
              </Box>
            )}
          </Box>
        );
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          setCurrentView={setCurrentView}
          toggleTheme={toggleTheme}
        />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box component="main" sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
            {renderContent()}
          </Box>
          <Box
            component="footer"
            sx={{ p: 2, borderTop: 1, borderColor: "divider" }}
          >
            <form onSubmit={handleSubmit}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  maxWidth: "48rem",
                  mx: "auto",
                }}
              >
                <ModelSelector
                  onChange={handleModelChange}
                  value={selectedModel}
                  //disabled={isProcessing}
                />
                <TextField
                  fullWidth
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  variant="outlined"
                  autoComplete="off"
                  //disabled={isProcessing}
                  sx={{ flexGrow: 1 }}
                />
                <Button 
                  variant="outlined" 
                  startIcon={<AttachFileIcon />}
                  //disabled={isProcessing}
                >
                  {/* Attach */}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={isProcessing || !input.trim()}
                >
                  {/* Send */}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
