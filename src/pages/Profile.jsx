import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import GoogleCalendarPanel from "../components/GoogleCalendarPanel";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({ name, email: email.trim().toLowerCase() });
    addToast("Profile updated");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-2xl font-bold text-gold">
          {user.name?.[0]?.toUpperCase() ?? <User size={24} />}
        </div>
        <div>
          <h1 className="text-xl font-bold text-navy">{user.name}</h1>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-navy">Account details</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-light"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      <GoogleCalendarPanel />

      <button
        onClick={handleLogout}
        className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-av-red transition hover:bg-av-red/5"
      >
        <LogOut size={15} />
        Log Out
      </button>
    </div>
  );
}
