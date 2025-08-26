import { useForm } from "react-hook-form";
import { api } from "../api";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { setToken } from "../api";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const set = useAuth((s) => s.set);
  const nav = useNavigate();

  const onSubmit = async (data:any) => {
    const r = await api.post("/register", data);
    set({ user: r.data.user, token: r.data.token });
    setToken(r.data.token);
    nav("/");
  };

  return (
    <div className="center">
      <div className="card form">
        <h2>Create your account</h2>
        <p className="sub">Save sources, categories and authors you love</p>
        <input className="input" {...register("name")} placeholder="Name" />
        <input className="input" {...register("email")} placeholder="Email" />
        <input className="input" type="password" {...register("password")} placeholder="Password" />
        <button className="btn" onClick={handleSubmit(onSubmit)}>Create Account</button>
        <p className="sub">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
