import { useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Plus, Compass } from "lucide-react";
import MyDay from "./pages/MyDay";
import ClientDetail from "./pages/ClientDetail";
import AddClientModal from "./components/AddClientModal";

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-navy">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-navy">
              <Compass size={18} strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Advisor<span className="text-gold">Pilot</span>
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/my-day"
              className={({ isActive }) =>
                `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? "bg-white/10 text-gold" : "text-slate-300 hover:text-white"
                }`
              }
            >
              My Day
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
        <Routes>
          <Route path="/" element={<Navigate to="/my-day" replace />} />
          <Route path="/my-day" element={<MyDay />} />
          <Route path="/client/:id" element={<ClientDetail />} />
        </Routes>
      </main>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-gold/30 transition hover:scale-105 hover:bg-gold-light active:scale-95"
      >
        <Plus size={18} strokeWidth={2.5} />
        Add Client
      </button>

      <AddClientModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
