import { useForm } from "react-hook-form";
import { api, setToken } from "../api";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const set = useAuth((s) => s.set);
  const nav = useNavigate();
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  const onSubmit = async (data:any) => {
    setLoading(true); setError(null);
    try {
      const r = await api.post("/register", data);
      set({ user: r.data.user, token: r.data.token });
      setToken(r.data.token);
      nav("/");
    } catch (e:any) {
      const res = e?.response;
      const msg =
        res?.data?.message ||
        (res?.data?.errors && Object.values(res.data.errors).flat().join(", ")) ||
        "Registration failed.";
      setError(String(msg));
    } finally { setLoading(false); }
  };

  return (
    <div className="center">
      <div className="card form">
        <h2>Create your account</h2>
        {error && <div style={{background:"#2b1d1f",border:"1px solid #a33",color:"#fbb",padding:8,borderRadius:8}}>{error}</div>}
        <input className="input" {...register("name", {required:true})} placeholder="Name" />
        <input className="input" {...register("email", {required:true})} placeholder="Email" />
        <input className="input" type="password" {...register("password", {required:true,minLength:6})} placeholder="Password (min 6)" />
        <button className="btn" disabled={loading} onClick={handleSubmit(onSubmit)}>{loading ? "Creating…" : "Create Account"}</button>
        <p className="sub">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
