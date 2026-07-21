import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SESSION_KEY = "advisorpilot.session";
const USERS_KEY = "advisorpilot.users";

const AuthContext = createContext(null);

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load users from localStorage", e);
  }
  return {
    "sojagh34vlcc@wfgmail.ca": {
      name: "Soroush Ojagh",
      email: "sojagh34vlcc@wfgmail.ca",
      password: "Mm315201",
    },
  };
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load session from localStorage", e);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [user, setUser] = useState(loadSession);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const login = (email, password) => {
    const key = email.trim().toLowerCase();
    const record = users[key];
    if (!record || record.password !== password) {
      throw new Error("Invalid email or password");
    }
    const session = { name: record.name, email: record.email };
    setUser(session);
    return session;
  };

  const register = (name, email, password) => {
    const key = email.trim().toLowerCase();
    if (users[key]) throw new Error("An account with this email already exists");
    const record = { name: name.trim(), email: key, password };
    setUsers((prev) => ({ ...prev, [key]: record }));
    const session = { name: record.name, email: record.email };
    setUser(session);
    return session;
  };

  const requestPasswordReset = (email) => {
    const key = email.trim().toLowerCase();
    if (!users[key]) throw new Error("No account found with that email");
    return true;
  };

  const updateProfile = (patch) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      setUsers((prevUsers) => ({
        ...prevUsers,
        [prev.email]: { ...prevUsers[prev.email], ...patch },
      }));
      return next;
    });
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({ user, login, register, logout, requestPasswordReset, updateProfile }),
    [user, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
