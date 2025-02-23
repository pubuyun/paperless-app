import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import IconButton from "@mui/material/IconButton"
import Divider from "@mui/material/Divider"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AddIcon from "@mui/icons-material/Add"
import FeedbackIcon from "@mui/icons-material/Feedback"
import HelpIcon from "@mui/icons-material/Help"
import ChatIcon from "@mui/icons-material/Chat"
import PersonIcon from "@mui/icons-material/Person"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import { useTheme } from "@mui/material/styles"

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
  setCurrentView: (view: string) => void
  toggleTheme: () => void
}

export function Sidebar({ isOpen, toggleSidebar, setCurrentView, toggleTheme }: SidebarProps) {
  const theme = useTheme()
  const recentChats = ["Chat 1", "Chat 2", "Chat 3"]

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      sx={{
        width: isOpen ? 240 : theme.spacing(7),
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isOpen ? 240 : theme.spacing(7),
          boxSizing: "border-box",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: "hidden",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", p: 1 }}>
        <IconButton onClick={toggleTheme}>
          {theme.palette.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
        <IconButton onClick={toggleSidebar}>{isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? "initial" : "center",
              px: 2.5,
            }}
            onClick={() => setCurrentView("chat")}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary="New Chat" sx={{ opacity: isOpen ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {["Feedback", "FAQ"].map((text, index) => (
          <ListItem key={text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isOpen ? "initial" : "center",
                px: 2.5,
              }}
              onClick={() => setCurrentView(text.toLowerCase())}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isOpen ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                {index % 2 === 0 ? <FeedbackIcon /> : <HelpIcon />}
              </ListItemIcon>
              <ListItemText primary={text} sx={{ opacity: isOpen ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem sx={{ pb: 0 }}>
          <ListItemText primary="Recent Chats" sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItem>
        {recentChats.map((text, index) => (
          <ListItem key={text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: isOpen ? "initial" : "center",
                px: 2.5,
              }}
              onClick={() => setCurrentView("chat")}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isOpen ? 3 : "auto",
                  justifyContent: "center",
                }}
              >
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary={text} sx={{ opacity: isOpen ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItem disablePadding sx={{ display: "block" }}>
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: isOpen ? "initial" : "center",
              px: 2.5,
            }}
            onClick={() => setCurrentView("profile")}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isOpen ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Username" secondary="Pro Tier" sx={{ opacity: isOpen ? 1 : 0 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

