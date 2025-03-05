"use client";

import React, { useState, useRef, useCallback } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import { Sidebar } from "@/components/sidebar";
import { ModelSelector } from "@/components/model-selector";
import { FAQ } from "@/components/faq";
import { Feedback } from "@/components/feedback";
import { UserProfile } from "@/components/user-profile";
import { MessageView } from "@/components/message-view";
import { Message } from "@/types/message";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("chat");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null); //auto select/focus textbox

  const currentTheme = React.useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: "#2acbb6" },
          mode,
        },
      }),
    [mode]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleModelChange = useCallback((model: string) => {
    console.log("Model changed to:", model); // debugging
    setSelectedModel(model);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true); //set processing
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setIsTyping(true);
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    inputRef.current?.focus(); //focus to textbox

    try {
      const requestBody = {
        messages: [...messages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
        model: selectedModel,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
          // .filter((line) => line.startsWith("data: "))
          // .map((line) => {
          //   try {
          //     // parse json encoded data
          //     return JSON.parse(line.slice(6));
          //   } catch {
          //     return line.slice(6);
          //   }
          // });
        .map((lines) => {
          try{
            return lines+"\n";
          } catch{
            console.log("Error displaying");
            return "erm";
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

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setCurrentView={setCurrentView}
          toggleTheme={() => setMode(mode === "light" ? "dark" : "light")}
        />
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box component="main" sx={{ flexGrow: 1, overflow: "auto", p: 3 }}>
            {currentView === "chat" ? (
              <MessageView messages={messages} isTyping={isTyping} />
            ) : currentView === "faq" ? (
              <FAQ />
            ) : currentView === "feedback" ? (
              <Feedback />
            ) : currentView === "profile" ? (
              <UserProfile />
            ) : null}
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
                />
                <TextField
                  inputRef={inputRef}
                  fullWidth
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  variant="outlined"
                  autoComplete="off"
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="outlined" startIcon={<AttachFileIcon />} />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={isProcessing || !input.trim()}
                />
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
