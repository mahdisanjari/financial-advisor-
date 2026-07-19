import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard, { AuthField, authInputClass } from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      register(form.name, form.email, form.password);
      addToast(`Welcome to AdvisorPilot, ${form.name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Set up AdvisorPilot in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gold-dark hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label="Full Name">
          <input
            required
            value={form.name}
            onChange={update("name")}
            className={authInputClass()}
            placeholder="Jane Doe"
          />
        </AuthField>
        <AuthField label="Email">
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            className={authInputClass()}
            placeholder="you@example.com"
          />
        </AuthField>
        <AuthField label="Password">
          <input
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            className={authInputClass()}
            placeholder="At least 6 characters"
          />
        </AuthField>
        <AuthField label="Confirm Password">
          <input
            type="password"
            required
            value={form.confirm}
            onChange={update("confirm")}
            className={authInputClass()}
            placeholder="••••••••"
          />
        </AuthField>

        {error && <p className="text-xs text-av-red">{error}</p>}

        <button
          type="submit"
          className="mt-1 w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-light"
        >
          Create Account
        </button>
      </form>
    </AuthCard>
  );
}
