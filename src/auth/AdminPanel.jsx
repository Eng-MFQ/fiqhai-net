import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useAuth } from "./AuthContext";

export default function AdminPanel() {
  const { session, fetchAllUsers, deleteUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setError("");
      setLoading(true);
      const list = await fetchAllUsers();
      setUsers(list);
    } catch (e) {
      setError("تعذر جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadUsers();
  }, [open]);

  if (!session?.isAdmin) return null;

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="md"
        open={open}
        onClose={() => setOpen(false)}
        dir="rtl"
      >
        <DialogTitle>لوحة الإدارة</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>المعرف</TableCell>
                  <TableCell>البريد الإلكتروني</TableCell>
                  <TableCell>الاسم</TableCell>
                  <TableCell align="left">إجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell align="left">
                      <IconButton
                        color="error"
                        onClick={async () => {
                          await deleteUser(u.id);
                          await loadUsers();
                        }}
                        disabled={loading}
                      >
                        <Icon>delete</Icon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
