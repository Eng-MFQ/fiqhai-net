import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  Stack,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  ManageAccounts as ManageAccountsIcon,
} from "@mui/icons-material";
import AgentixChatBook from "./Agentic/UI/AgentixChatBook";
import BookSearch from "./Agentic/SearcBook";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import AuthGate from "./auth/AuthGate";
import AdminPanel from "./auth/AdminPanel";
import SettingsPanel from "./auth/SettingsPanel";
import UserManagement from "./auth/UserManagement";

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#ff5722", // your primary color
    },
    text: {
      primary: "#212121",
      secondary: "#212121",
      body: "#212121",
      headline: "#ff5722",
    },
  },
});

function Shell() {
  const { session, loading, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userManagementOpen, setUserManagementOpen] = useState(false);

  if (loading) return null;

  if (!session) {
    return <AuthGate />;
  }

  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            موسوعة الفقه الإسلامي
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {session.username || session.email}
              {session.isAdmin ? " (نبيل المدير)" : ""}
            </Typography>
            {session.isAdmin && (
              <>
                <Tooltip title="User Management" arrow>
                  <IconButton
                    color="primary"
                    onClick={() => setUserManagementOpen(true)}
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                    }}
                  >
                    <ManageAccountsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="إعدادات النظام" arrow>
                  <IconButton
                    color="primary"
                    onClick={() => setSettingsOpen(true)}
                    sx={{
                      border: "1px solid",
                      borderColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <AdminPanel />
              </>
            )}
            <Button variant="outlined" onClick={logout}>
              خروج
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box>
        <Routes>
          <Route
            path="/agentixIslam/BookSearch/:bookId"
            element={<BookSearch />}
          />
          <Route path="/" element={<AgentixChatBook />} />
        </Routes>
      </Box>

      {/* User Management Dialog */}
      {session.isAdmin && (
        <UserManagement
          open={userManagementOpen}
          onClose={() => setUserManagementOpen(false)}
        />
      )}

      {/* Settings Panel Dialog */}
      {session.isAdmin && (
        <SettingsPanel
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </>
  );
}

function PricingTraining() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Shell />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default PricingTraining;
