import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiUrl } from "../api";

const AuthContext = createContext(null);

const ADMIN_EMAIL = "fiqhbook0@gmail.com";
const ADMIN_PASSWORD = "Fiqhbook@1234";
const STORAGE_KEY = "auth.session.v1";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSession(parsed);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (next) => {
    setSession(next);
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const signup = async ({ email, password, username }) => {
    const response = await fetch(`${apiUrl}/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ email, password, username }),
    });
    if (!response.ok) throw new Error("Signup failed");
    const user = await response.json();
    return user; // contains id
  };

  const login = async ({ email, password }) => {
    // Admin shortcut (email+password must match exactly)
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminSession = {
        client_id: "admin",
        email,
        username: "Administrator",
        isAdmin: true,
      };
      persist(adminSession);
      return adminSession;
    }

    // URL encode email and password for the API call
    const encodedEmail = encodeURIComponent(email);
    const encodedPassword = encodeURIComponent(password);

    const response = await fetch(
      `${apiUrl}/users/login/${encodedEmail}/${encodedPassword}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }

    const data = await response.json();
    const nextSession = { ...data, isAdmin: false };
    persist(nextSession);
    return nextSession;
  };

  const logout = () => {
    persist(null);
  };

  const fetchAllUsers = async () => {
    if (!session?.isAdmin) throw new Error("Not authorized");
    const response = await fetch(`${apiUrl}/users/fetch`, {
      method: "GET",
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  };

  const deleteUser = async (id) => {
    if (!session?.isAdmin) throw new Error("Not authorized");
    const response = await fetch(`${apiUrl}/users/delete/${id}`, {
      method: "DELETE",
      headers: { accept: "*/*" },
    });
    if (!response.ok) throw new Error("Failed to delete user");
    return true;
  };

  const value = useMemo(
    () => ({
      session,
      loading,
      login,
      logout,
      signup,
      fetchAllUsers,
      deleteUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
