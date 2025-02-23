"use client"

import React, { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import SendIcon from "@mui/icons-material/Send"
import AttachFileIcon from "@mui/icons-material/AttachFile"
import { Sidebar } from "@/components/sidebar"
import { ModelSelector } from "@/components/model-selector"
import { FAQ } from "@/components/faq"
import { Feedback } from "@/components/feedback"
import { UserProfile } from "@/components/user-profile"

const theme = createTheme({
  palette: {
    primary: {
      main: "#2acbb6",
    },
    mode: "light",
  },
})

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [currentView, setCurrentView] = useState("chat")
  const [mode, setMode] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
  }

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
    [mode],
  )

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      setIsTyping(true)
      handleSubmit(e).then(() => setIsTyping(false))
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const renderContent = () => {
    switch (currentView) {
      case "faq":
        return <FAQ />
      case "feedback":
        return <Feedback />
      case "profile":
        return <UserProfile />
      default:
        return (
          <Box sx={{ maxWidth: "48rem", mx: "auto", my: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    maxWidth: "75%",
                    p: 2,
                    borderRadius: 2,
                    bgcolor: message.role === "user" ? "primary.main" : "background.paper",
                    color: message.role === "user" ? "primary.contrastText" : "text.primary",
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: "background.paper" }}>Typing...</Box>
              </Box>
            )}
          </Box>
        )
    }
  }

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
          <Box component="footer" sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <form onSubmit={onSubmit}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, maxWidth: "48rem", mx: "auto" }}>
                <ModelSelector />
                <TextField
                  fullWidth
                  value={input}
                  onChange={(e) => handleInputChange(e as any)}
                  placeholder="Type your message..."
                  variant="outlined"
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="outlined" startIcon={<AttachFileIcon />}>
                  Attach
                </Button>
                <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                  Send
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

