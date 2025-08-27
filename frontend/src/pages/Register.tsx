import { useForm } from "react-hook-form";
import { api, setToken } from "../api";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

type Form = { name: string; email: string; password: string };

export default function Register() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } =
    useForm<Form>({ mode: "onChange" }); // validate live
  const set = useAuth((s) => s.set);
  const nav = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: Form) => {
    setServerError(null);
    try {
      const r = await api.post("/register", data);
      set({ user: r.data.user, token: r.data.token });
      setToken(r.data.token);
      nav("/");
    } catch (e: any) {
      const res = e?.response;
      const msg =
        res?.data?.message ||
        (res?.data?.errors && Object.values(res.data.errors).flat().join(", ")) ||
        "Registration failed.";
      setServerError(String(msg));
    }
  };

  return (
    <div className="center">
      <div className="card form">
        <h2>Create your account</h2>
        {serverError && (
          <div style={{ background: "#2b1d1f", border: "1px solid #a33", color: "#fbb", padding: 8, borderRadius: 8 }}>
            {serverError}
          </div>
        )}

        <div>
          <input
            className={`input ${errors.name ? "error" : ""}`}
            placeholder="Name"
            {...register("name", { required: "Name is required" })}
            aria-invalid={!!errors.name || undefined}
          />
          {errors.name && <div className="error">{errors.name.message}</div>}
        </div>

        <div>
          <input
            className={`input ${errors.email ? "error" : ""}`}
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            })}
            aria-invalid={!!errors.email || undefined}
          />
          {errors.email && <div className="error">{errors.email.message}</div>}
        </div>

        <div>
          <input
            type="password"
            className={`input ${errors.password ? "error" : ""}`}
            placeholder="Password (min 8 chars)"
            {...register("password", {
              required: "Psassword is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
            aria-invalid={!!errors.password || undefined}
          />
          {errors.password && <div className="error">{errors.password.message}</div>}
        </div>

        <button className="btn" disabled={!isValid || isSubmitting} onClick={handleSubmit(onSubmit)}>
          {isSubmitting ? "Creating…" : "Create Account"}
        </button>

        <p className="sub">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
