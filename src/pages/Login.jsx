import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard, { AuthField, authInputClass } from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("sojagh34vlcc@wfgmail.ca");
  const [password, setPassword] = useState("Mm315201");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      login(email, password);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to see what needs your attention today."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-gold-dark hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthField label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass()}
            placeholder="you@example.com"
          />
        </AuthField>
        <AuthField label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass()}
            placeholder="••••••••"
          />
        </AuthField>

        {error && <p className="text-xs text-av-red">{error}</p>}

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-xs font-medium text-slate-500 hover:text-navy">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="mt-1 w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-light"
        >
          Log In
        </button>

        <p className="text-center text-xs text-slate-400">
          Demo account pre-filled — just hit Log In.
        </p>
      </form>
    </AuthCard>
  );
}
