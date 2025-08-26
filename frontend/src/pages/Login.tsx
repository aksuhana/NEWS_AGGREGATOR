import { useForm } from "react-hook-form";
import { api, setToken } from "../api";
import { useAuth } from "../store/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const set = useAuth((s) => s.set);
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  const onSubmit = async (data:any) => {
    setLoading(true); setError(null);
    try {
      const r = await api.post("/login", data);
      set({ user: r.data.user, token: r.data.token });
      setToken(r.data.token);
      nav(loc.state?.from?.pathname || "/");
    } catch (e:any) {
      const msg = e?.response?.data?.message || "Login failed. Check your email/password.";
      setError(String(msg));
    } finally { setLoading(false); }
  };

  return (
    <div className="center">
      <div className="card form">
        <h2>Welcome back</h2>
        {error && <div style={{background:"#2b1d1f",border:"1px solid #a33",color:"#fbb",padding:8,borderRadius:8}}>{error}</div>}
        <input className="input" {...register("email", {required:true})} placeholder="Email" />
        <input className="input" type="password" {...register("password", {required:true})} placeholder="Password" />
        <button className="btn" disabled={loading} onClick={handleSubmit(onSubmit)}>{loading ? "Signing in…" : "Login"}</button>
        <p className="sub">No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
