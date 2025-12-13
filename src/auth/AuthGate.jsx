import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import LinkedinAITheme from "../style/LinkedinAITheme";
import { useAuth } from "./AuthContext";

export default function AuthGate() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setError("فشل تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemeProvider theme={LinkedinAITheme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, direction: "rtl" }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
            تسجيل الدخول
          </Typography>
          <Typography
            variant="body2"
            sx={{ mb: 3, textAlign: "center" }}
            color="text.secondary"
          >
            أدخل البريد الإلكتروني وكلمة المرور. للمسؤول استخدم البريد وكلمة
            المرور الخاصة بالإدارة.
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField
                label="البريد الإلكتروني"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <TextField
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
              />
              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "جاري الدخول..." : "دخول"}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
