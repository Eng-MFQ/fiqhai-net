import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Divider,
  Tooltip,
  Fade,
  Collapse,
  Stack,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { apiUrl } from "../api";

export default function UserManagement({ open, onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const [emailError, setEmailError] = useState("");

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/users/fetch`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.username) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const newUser = await response.json();
      setSuccessMessage(`User "${newUser.username}" created successfully! ✓`);
      setSnackbarOpen(true);
      setShowAddForm(false);
      setFormData({ email: "", password: "", username: "" });
      setEmailError("");
      await fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    setDeletingId(userId);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/users/delete/${userId}`, {
        method: "DELETE",
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      // Try to parse JSON, but handle if response is empty or not JSON
      let result;
      try {
        result = await response.json();
      } catch {
        // If JSON parsing fails, assume success if status was ok
        result = { Success: true };
      }

      if (result.Success || result.success || response.ok) {
        // Update the local state immediately
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        setSuccessMessage(`User "${username}" deleted successfully! ✓`);
        setSnackbarOpen(true);
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      setError(err.message);
      // If error occurred, refetch to make sure UI is in sync
      await fetchUsers();
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear email error when user starts typing
    if (field === "email") {
      setEmailError("");
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleClose = () => {
    setShowAddForm(false);
    setFormData({ email: "", password: "", username: "" });
    setEmailError("");
    setError(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleIcon fontSize="large" />
            <Box>
              <Typography variant="h6" component="div">
                User Management
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Manage system users and permissions
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            sx={{ color: "white" }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {/* Action Bar */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${users.length} Total Users`}
                color="primary"
                variant="outlined"
                icon={<PeopleIcon />}
              />
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowAddForm(!showAddForm)}
                sx={{
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #45a049 0%, #276d28 100%)",
                  },
                }}
              >
                Add User
              </Button>
            </Stack>
          </Box>

          {/* Add User Form */}
          <Collapse in={showAddForm}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                border: "2px solid",
                borderColor: "primary.main",
                borderRadius: 2,
                background:
                  "linear-gradient(to bottom, #f0f9ff 0%, white 100%)",
              }}
            >
              <Typography
                variant="h6"
                color="primary"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <PersonAddIcon />
                Create New User
              </Typography>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={(e) => handleFormChange("username", e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  variant="outlined"
                  error={!!emailError}
                  helperText={emailError}
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Box
                  sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ email: "", password: "", username: "" });
                      setEmailError("");
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleAddUser}
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <CheckCircleIcon />
                      )
                    }
                    sx={{
                      borderRadius: 2,
                      background:
                        "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)",
                    }}
                  >
                    Create User
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Collapse>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          {/* Users Table */}
          {loading && !users.length ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background:
                        "linear-gradient(to right, #f8f9fa 0%, #e9ecef 100%)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>User ID</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <Fade in key={user.id} timeout={300 + index * 100}>
                      <TableRow
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: "action.hover",
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: "primary.main",
                                width: 40,
                                height: 40,
                              }}
                            >
                              {user.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography fontWeight="500">
                              {user.username}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.id}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Delete User" arrow>
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDeleteUser(user.id, user.username)
                              }
                              disabled={deletingId === user.id}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "error.light",
                                  color: "error.contrastText",
                                },
                              }}
                            >
                              {deletingId === user.id ? (
                                <CircularProgress size={24} color="inherit" />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fade>
                  ))}
                  {users.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No users found. Create your first user!
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            gap: 1,
            background: "linear-gradient(to top, #f8f9fa 0%, white 100%)",
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
