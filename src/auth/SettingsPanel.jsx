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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import { apiUrl } from "../api";

export default function SettingsPanel({ open, onClose }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState(false);

  // Fetch settings when dialog opens
  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/nabil_settings/fetch`);
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/nabil_settings/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      const result = await response.json();
      if (result.Success) {
        setSuccessMessage("تم حفظ الإعدادات بنجاح!");
        setSnackbarOpen(true);
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsIcon />
            <Typography variant="h6" component="div">
              إعدادات النظام
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white" }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {loading ? (
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
          ) : error ? (
            <Alert
              severity="error"
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={fetchSettings}
                >
                  <RefreshIcon />
                </IconButton>
              }
            >
              {error}
            </Alert>
          ) : settings ? (
            <Stack spacing={3}>
              {/* System Prompt */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    System Prompt
                    <Chip label="Required" size="small" color="error" />
                  </Typography>
                  <IconButton
                    onClick={() => setExpandedPrompt(!expandedPrompt)}
                    size="small"
                    sx={{
                      color: "primary.main",
                      border: "1px solid",
                      borderColor: "primary.main",
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                    }}
                  >
                    {expandedPrompt ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={expandedPrompt ? 20 : 8}
                  value={settings.system_prompt}
                  onChange={(e) =>
                    handleChange("system_prompt", e.target.value)
                  }
                  variant="outlined"
                  placeholder="Enter the system prompt for the AI..."
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                      transition: "all 0.3s ease",
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* API Key */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  API Key
                  <Chip label="Sensitive" size="small" color="warning" />
                </Typography>
                <TextField
                  fullWidth
                  type={showApiKey ? "text" : "password"}
                  value={settings.api_key}
                  onChange={(e) => handleChange("api_key", e.target.value)}
                  variant="outlined"
                  placeholder="Enter your API key..."
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowApiKey(!showApiKey)}
                          edge="end"
                          sx={{
                            color: "primary.main",
                            "&:hover": {
                              backgroundColor: "primary.light",
                            },
                          }}
                        >
                          {showApiKey ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* AI Model Selection */}
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  Gemini AI Model
                  <Tooltip
                    title={
                      <Box sx={{ p: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          gutterBottom
                        >
                          📋 Available Models - Copy one of these:
                        </Typography>
                        <Box
                          component="ul"
                          sx={{
                            m: 0,
                            pl: 2,
                            "& li": {
                              fontFamily: "monospace",
                              fontSize: "0.9rem",
                              py: 0.3,
                            },
                          }}
                        >
                          <li>gemini-2.5-flash</li>
                          <li>gemini-2.5-flash-lite</li>
                          <li>gemini-2.5-pro</li>
                        </Box>
                      </Box>
                    }
                    arrow
                    placement="right"
                  >
                    <InfoIcon sx={{ fontSize: 20, cursor: "help" }} />
                  </Tooltip>
                </Typography>
                <TextField
                  fullWidth
                  value={settings.gemini_ai_model}
                  onChange={(e) =>
                    handleChange("gemini_ai_model", e.target.value)
                  }
                  variant="outlined"
                  placeholder="e.g., gemini-2.5-flash"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      fontFamily: "monospace",
                    },
                  }}
                />
              </Box>

              <Divider />

              {/* Numeric Settings */}
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    Search Range
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2">
                            📚 How many pages to include in deep search
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, fontWeight: "bold" }}
                          >
                            💡 Recommended: 50-100
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="right"
                    >
                      <InfoIcon sx={{ fontSize: 20, cursor: "help" }} />
                    </Tooltip>
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={settings.search_range}
                    onChange={(e) =>
                      handleChange("search_range", parseInt(e.target.value))
                    }
                    variant="outlined"
                    inputProps={{ min: 1, max: 200 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="primary"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    Temperature
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2">
                            🌡️ Controls AI creativity:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            • Low (0.0-0.5): More focused & consistent
                          </Typography>
                          <Typography variant="body2">
                            • Medium (0.6-1.0): Balanced
                          </Typography>
                          <Typography variant="body2">
                            • High (1.1-2.0): More creative & varied
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement="right"
                    >
                      <InfoIcon sx={{ fontSize: 20, cursor: "help" }} />
                    </Tooltip>
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={settings.temperature}
                    onChange={(e) =>
                      handleChange("temperature", parseFloat(e.target.value))
                    }
                    variant="outlined"
                    inputProps={{ min: 0, max: 2, step: 0.1 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              {/* Thinking Mode Toggle */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.isThinking}
                      onChange={(e) =>
                        handleChange("isThinking", e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="subtitle1" fontWeight="bold">
                      Enable Thinking Mode
                    </Typography>
                  }
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ ml: 4 }}
                >
                  When enabled, the AI Answers will be more detailed and
                  accurate (but slower)
                </Typography>
              </Box>
            </Stack>
          ) : null}
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
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            إلغاء
          </Button>
          <Button
            onClick={fetchSettings}
            variant="outlined"
            startIcon={<RefreshIcon />}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            تحديث
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            disabled={saving || !settings}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #63408a 100%)",
              },
            }}
          >
            حفظ الإعدادات
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
