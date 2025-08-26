import { useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./store/auth";
import { setToken } from "./api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = useAuth((s) => s.token);
  const loc = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const set = useAuth((s) => s.set);
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) { set({ token: saved }); setToken(saved); }
  }, [set]);

  return (
    <div className="shell">
      <nav className="nav">
        <Link to="/">Home</Link>
        <div className="spacer" />
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Register/>} />
        <Route path="/" element={<RequireAuth><Feed/></RequireAuth>} />
      </Routes>
    </div>
  );
}
