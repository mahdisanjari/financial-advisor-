import { useState } from "react";
import { X } from "lucide-react";
import { useClients } from "../context/ClientsContext";
import { useToast } from "../context/ToastContext";

const EMPTY_FORM = {
  first: "",
  last: "",
  phone: "",
  email: "",
  priority: "Medium",
  nextFollowUpDate: "",
  notes: "",
};

export default function AddClientModal({ open, onClose }) {
  const { addClient } = useClients();
  const { addToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  if (!open) return null;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.first.trim()) nextErrors.first = "First name is required";
    if (!form.last.trim()) nextErrors.last = "Last name is required";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const client = addClient(form);
    addToast(`${client.first} ${client.last} added to pipeline`);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl animate-slide-up sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-navy">Add Client</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-navy"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name" required error={errors.first}>
              <input
                autoFocus
                value={form.first}
                onChange={update("first")}
                className={inputClass(errors.first)}
                placeholder="Jane"
              />
            </Field>
            <Field label="Last Name" required error={errors.last}>
              <input
                value={form.last}
                onChange={update("last")}
                className={inputClass(errors.last)}
                placeholder="Doe"
              />
            </Field>
          </div>

          <Field label="Phone">
            <input
              type="tel"
              value={form.phone}
              onChange={update("phone")}
              className={inputClass()}
              placeholder="(555) 123-4567"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              className={inputClass()}
              placeholder="jane.doe@email.com"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <select value={form.priority} onChange={update("priority")} className={inputClass()}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </Field>
            <Field label="Next Follow-up Date">
              <input
                type="date"
                value={form.nextFollowUpDate}
                onChange={update("nextFollowUpDate")}
                className={inputClass()}
              />
            </Field>
          </div>

          <Field label="Initial Notes">
            <textarea
              value={form.notes}
              onChange={update("notes")}
              rows={3}
              className={inputClass()}
              placeholder="Anything worth remembering about this client..."
            />
          </Field>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-light"
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="text-av-red"> *</span>}
      </span>
      {children}
      {error && <span className="text-xs text-av-red">{error}</span>}
    </label>
  );
}

function inputClass(error) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30 ${
    error ? "border-av-red" : "border-slate-200"
  }`;
}
