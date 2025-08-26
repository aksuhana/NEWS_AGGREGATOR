import { useEffect } from "react";
import type { ReactElement } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./store/auth";
import { setToken, api } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import "./styles.css";

function RequireAuth({ children }: { children: ReactElement }) {
  const token = useAuth((s) => s.token);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const { set, token, user, logout } = useAuth();
  const nav = useNavigate();

  // Restore from localStorage only (no backend call)
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser  = localStorage.getItem("user");
    if (savedToken) {
      set({ token: savedToken });
      setToken(savedToken);
    }
    if (savedUser) {
      try { set({ user: JSON.parse(savedUser) }); } catch {}
    }
  }, [set]);

  async function onLogout() {
    try { await api.post("/logout"); } catch {}
    setToken(undefined);
    logout();
    nav("/login");
  }

  return (
    <div className="shell">
      <nav className="nav">
        <Link to="/">Home</Link>
        <div className="spacer" />
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <span style={{ opacity:.8 }}>Hello, {user?.name ?? "User"}</span>
            <button className="btn secondary" onClick={onLogout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/" element={<RequireAuth><Feed/></RequireAuth>} />
      </Routes>
    </div>
  );
}
