/* eslint-disable react/prop-types */
import React, { useEffect, useRef, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  CircularProgress,
  Drawer,
  Icon,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ReactMarkdown from "react-markdown";
import { styled } from "@mui/system";
import AgentixSearchHelper from "./AgentixSearchHelper";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AthkarHelper from "./AthkarHelper";
import { Close } from "@mui/icons-material";
import { apiUrl } from "../../api";

const API_URL = `${apiUrl}/book/chat/no_stream_nabil`;

// --- MUI Theme for consistent branding ---
const theme = createTheme({
  palette: {
    primary: {
      main: "#FF5622", // Primary branding color
    },
    text: {
      primary: "#000000", // Black for all normal text
    },
    background: {
      default: "linear-gradient(135deg, #4DFFFA, #FFF7AD)",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif", // A clean, modern font
    // Set headline color to primary
    h1: { color: "#FF5622" },
    h2: { color: "#FF5622" },
    h3: { color: "#FF5622" },
    h4: { color: "#FF5622" },
    h5: { color: "#FF5622" },
    h6: { color: "#FF5622" },
    body1: { color: "#000000" },
    body2: { color: "#000000" },
    caption: { color: "#4a4646ff" },
  },
});

const drawerWidth = 450; // Width of the search helper drawer

// Styled component for the main content area to handle drawer transition
const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth, // Start with drawer closed
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0, // Shift left when drawer opens
    }),
    [theme.breakpoints.down("md")]: {
      marginRight: 0,
      padding: theme.spacing(1),
    },
  })
);

function MessageBubble({ role, content, onCopy, copied }) {
  const isUser = role === "user";
  return (
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent={isUser ? "flex-end" : "flex-start"}
      alignItems="flex-end"
    >
      {!isUser && (
        <Avatar
          sx={{ width: 32, height: 32, bgcolor: "primary.main" }}
          alt="AI"
        >
          <Icon sx={{ color: "white" }}>smart_toy</Icon>
        </Avatar>
      )}
      <Box>
        <Paper
          elevation={2}
          dir="auto"
          sx={{
            p: 1.5,
            maxWidth: "80%",
            minWidth: "150px",
            borderRadius: 4,
            bgcolor: isUser ? "primary.main" : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
          }}
        >
          {/* Using Typography for consistent text styling */}
          <Typography variant="body2" component="div" color="inherit">
            <ReactMarkdown
              components={{
                ol: ({ node, ...props }) => (
                  <Typography
                    color="black"
                    variant="body2"
                    paragraph
                    {...props}
                  />
                ),
                ul: ({ node, ...props }) => (
                  <Typography
                    color="red"
                    variant="body2"
                    paragraph
                    {...props}
                  />
                ),
                p: ({ node, ...props }) => (
                  <Typography
                    color="black"
                    variant="body2"
                    paragraph
                    {...props}
                  />
                ),
                li: ({ node, ...props }) => (
                  <Typography
                    color="black"
                    variant="body2"
                    paragraph
                    {...props}
                  />
                ),
                h3: ({ node, ...props }) => (
                  <Typography
                    color="black"
                    component="span"
                    fontWeight="bold"
                    {...props}
                  />
                ),
                strong: ({ node, ...props }) => (
                  <Typography
                    color="black"
                    component="span"
                    fontWeight="bold"
                    {...props}
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </Typography>
        </Paper>
        {/* Copy icon below bubble */}
        <Box
          sx={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
            mt: 0.5,
          }}
        >
          <Tooltip title={copied ? "تم النسخ!" : "نسخ"}>
            <IconButton size="small" onClick={onCopy}>
              <Icon
                sx={{
                  fontSize: 12,
                  color: copied ? "success.main" : "grey.700",
                }}
              >
                {copied ? "check" : "content_copy"}
              </Icon>
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {isUser && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: "grey.700" }} alt="User">
          <Icon sx={{ color: "white" }}>person</Icon>
        </Avatar>
      )}
    </Stack>
  );
}

export default function AgentixChatBook() {
  const [messages, setMessages] = useState([
    {
      id: "hello",
      role: "model",
      content: "مرحباً! كيف يمكنني مساعدتك اليوم في البحث؟",
    },
  ]);
  // Track which message is copied (by id)
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [input, setInput] = useState("");
  const [bookId, setBookId] = useState("fiqh_001-123456");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [bookInitData, setBookInitData] = useState(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false); // State for drawer
  const scrollRef = useRef(null);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // New state variables for the initial API call
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  // Open the drawer whenever there is new search data
  useEffect(() => {
    if (data) {
      setDrawerOpen(true);
    }
  }, [data]);

  useEffect(() => {
    const initChat = async () => {
      setIsInitializing(true);
      setInitError(false);
      console.log(`Initializing chat for book ID: ${bookId}`);

      if (!bookId) {
        setInitError(true);
        setIsInitializing(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/book/chat/init/`, {
          method: "POST", // Changed from 'GET' to 'POST'
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            // Sending book_id in the request body
            book_id: bookId,
          }),
        });

        console.log(response.body);
        if (!response.ok) {
          throw new Error("Book not found or API error");
        }

        const initData = await response.json();
        setBookInitData(initData);
        console.log("Initial data:", initData);
        setMessages([
          {
            id: "hello",
            role: "model",
            content: "مرحباً! كيف يمكنني مساعدتك اليوم في البحث؟",
          },
        ]);
      } catch (err) {
        console.error("Initial API call failed:", err);
        setInitError(true);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
  }, [bookId]);

  // The dependency array should include bookId to re-run the effect if it changes
  const onSearchSelected = (queryText) => {
    // This function is passed to the search helper
    // to trigger a new search from within the drawer
    setInput(queryText);
    setDrawerOpen(false); // Optionally close drawer after selection
  };

  const sendMessage = async (content) => {
    if (!content || loading) return;

    // 1. Create messages for local state update
    const userMsg = { id: `${Date.now()}-u`, role: "user", content };
    const assistantId = `${Date.now()}-a`;
    const placeholder = {
      id: assistantId,
      role: "model",
      content: "أقوم بالبحث الآن...",
    };

    // Assuming 'messages' is an array of objects like { id, role, content }
    setMessages((prev) => [...prev, userMsg, placeholder]);
    setLoading(true);
    setInput("");

    // 2. Prepare the history object for the API call
    // The API expects 'history' to be a list of { role: str, content: str } objects.
    const apiHistory = messages
      // Filter out the temporary placeholder message (and any other transient items)
      .filter((msg) => msg.id !== assistantId)
      // Map the messages to the required { role, content } structure
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // 3. Add the *current* user message to the history list for the API
    // (This is the message the AI is responding to)
    const historyForApi = [
      ...apiHistory,
      { role: userMsg.role, content: userMsg.content },
    ];

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat: content,
          book_id: "fiqh_001-123456",
          history: historyForApi,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const responseData = await res.json();
      console.log("--------------------------------");
      console.log(responseData);
      setData(responseData); // Save the full response

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  responseData.ai_answer.answer || responseData.ai_answer,
              }
            : m
        )
      );
    } catch (err) {
      console.error("Error during sendMessage:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "حدث خطأ. يرجى المحاولة مرة أخرى." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(input.trim());
  };

  if (isInitializing) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: theme.palette.background.default,
          }}
        >
          <CircularProgress color="primary" sx={{ mb: 2 }} />
          <Typography color="black" variant="h6">
            يتم التواصل مع الكتاب...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (initError) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: theme.palette.background.default,
          }}
        >
          <Icon color="error" sx={{ fontSize: 60, mb: 2 }}>
            error_outline
          </Icon>
          <Typography variant="h5" color="error" sx={{ mb: 1 }}>
            الكتاب غير موجود
          </Typography>
          <Typography variant="body1" color="text.secondary">
            يرجى التأكد من أن الكتاب صحيح.
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  // Copy handler for message bubbles
  const handleCopy = async (msgId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMsgId(msgId);
      setTimeout(() => {
        setCopiedMsgId(null);
      }, 1000);
    } catch (e) {
      // Optionally handle error
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: theme.palette.background.default,
        }}
      >
        {/* Main Chat Interface */}
        <Main
          open={!isMobile && isDrawerOpen}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            p: 0,
          }}
        >
          <AppBar
            position="static"
            elevation={1}
            sx={{ bgcolor: "background.paper" }}
          >
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                minHeight: 64,
                px: { xs: 1, sm: 2 },
                gap: 1,
              }}
            >
              {/* Far right: Search button */}
              <Box sx={{ display: "flex", alignItems: "center", zIndex: 1 }}>
                <Button
                  variant="text"
                  color="primary"
                  sx={{ display: "flex", alignItems: "center", minWidth: 0, p: { xs: 0.5, sm: 1 } }}
                  onClick={() => {
                    navigate(`/agentixIslam/BookSearch/${bookId}`);
                  }}
                  startIcon={<Icon sx={{ color: "primary.main", mr: { xs: 0, sm: 1 } }}>search</Icon>}
                >
                  <Typography variant="body1" sx={{ display: { xs: "none", sm: "block" } }}>البحث السريع</Typography>
                </Button>
              </Box>
              {/* Center: Title */}
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  left: 0,
                  right: 0,
                  pointerEvents: "none",
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    pointerEvents: "auto",
                    fontSize: { xs: "0.9rem", sm: "1.25rem" },
                    textAlign: "center",
                    px: { xs: 6, sm: 0 },
                    lineHeight: 1.2,
                  }}
                >
                  البحث في {bookInitData.book_name}
                </Typography>
              </Box>
              {/* Far left: Search helper icon */}
              <Box sx={{ display: "flex", alignItems: "center", ml: "auto", zIndex: 1 }}>
                {data && (
                  <Tooltip title="إظهار مساعد البحث">
                    <IconButton
                      color="primary"
                      onClick={() => setDrawerOpen(!isDrawerOpen)}
                    >
                      <Icon sx={{ color: "primary.main" }}>manage_search</Icon>
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Toolbar>
          </AppBar>

          {/* Chat Messages Area */}
          <Box
            ref={scrollRef}
            sx={{ flex: 1, overflowY: "auto", p: { xs: 1.5, sm: 3 } }}
          >
            <Stack spacing={2}>
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  onCopy={() => handleCopy(m.id, m.content)}
                  copied={copiedMsgId === m.id}
                />
              ))}
              {loading && (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  <CircularProgress color="primary" size={20} />
                  <Typography variant="body2" color="text.secondary">
                    يتم البحث...
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Composer / Input Area */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Centers the child horizontally
              alignItems: "flex-end", // Aligns the child to the bottom
              width: "100%",
            }}
          >
            <Paper
              elevation={3}
              component="form"
              onSubmit={handleFormSubmit}
              sx={{
                m: { xs: 1, sm: 2 },
                p: { xs: 0.25, sm: 0.5 },
                display: "flex",
                alignItems: "center",
                borderRadius: 4,
                width: "100%",
                maxWidth: 1000,
              }}
            >
              <Tooltip title="إرسال">
                <span>
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={loading || !input.trim()}
                  >
                    <Icon
                      sx={{ color: "primary.main", transform: "scaleX(-1)" }}
                    >
                      send
                    </Icon>
                  </IconButton>
                </span>
              </Tooltip>

              <TextField
                fullWidth
                variant="standard"
                placeholder="اكتب سؤالك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                multiline
                maxRows={5}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !isMobile) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    padding: "8px 16px",
                  },
                  "& .MuiInput-underline:before, & .MuiInput-underline:after, & .MuiInput-underline:hover:not(.Mui-disabled):before":
                    {
                      borderBottom: "none",
                    },
                }}
                inputProps={{
                  maxLength: 700,
                  style: {
                    direction: "rtl",
                    textAlign: "right",
                  },
                }}
              />
            </Paper>

            {/* Dialog to display the AthkarHelper component */}
            <Dialog
              open={openDialog}
              onClose={handleCloseDialog}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle sx={{ m: 0, p: 2 }}>
                مساعد الأذكار
                <IconButton
                  aria-label="close"
                  onClick={handleCloseDialog}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                  }}
                >
                  <Icon sx={{ color: "black" }}>close</Icon>
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <AthkarHelper />
              </DialogContent>
            </Dialog>
          </Box>
        </Main>

        {/* Search Helper Drawer */}
        <Drawer
          sx={{
            width: isMobile ? "100%" : drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: isMobile ? "100%" : drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant={isMobile ? "temporary" : "persistent"}
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <AgentixSearchHelper
            searchData={data}
            bookInitData={bookInitData}
            onSearchSelected={onSearchSelected}
            closeDrawer={() => setDrawerOpen(false)}
          />
        </Drawer>
      </Box>
    </ThemeProvider>
  );
}
