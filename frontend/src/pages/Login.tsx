import { useForm } from "react-hook-form";
import { api } from "../api";
import { useAuth } from "../store/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { setToken } from "../api";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const set = useAuth((s) => s.set);
  const nav = useNavigate();
  const loc = useLocation() as any;

  const onSubmit = async (data:any) => {
    const r = await api.post("/login", data);
    set({ user: r.data.user, token: r.data.token });
    setToken(r.data.token);
    nav(loc.state?.from?.pathname || "/");
  };

  return (
    <div className="center">
      <div className="card form">
        <h2>Welcome back</h2>
        <p className="sub">Sign in to your personalized news feed</p>
        <input className="input" {...register("email")} placeholder="Email" />
        <input className="input" type="password" {...register("password")} placeholder="Password" />
        <button className="btn" onClick={handleSubmit(onSubmit)}>Login</button>
        <p className="sub">No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
