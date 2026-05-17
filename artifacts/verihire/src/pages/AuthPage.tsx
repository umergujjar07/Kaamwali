import { useState } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/components/RoleContext";
import {
  ShieldCheck, Eye, EyeOff, ArrowLeft, User, Users,
  CheckCircle2, AlertCircle, Loader2, Sparkles,
} from "lucide-react";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Sialkot", "Hyderabad"];
const CATEGORIES = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

async function authFetch(path: string, body: object) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

export default function AuthPage() {
  const { role, setRole, login } = useRole();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    fullName: "", phone: "", city: "", category: "", cnicNumber: "",
    email: "", password: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const isWorker = role === "worker";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      let data;
      if (tab === "signin") {
        data = await authFetch(`/auth/${role}/login`, { email: form.email, password: form.password });
      } else {
        const payload: Record<string, string> = {
          email: form.email, password: form.password,
          fullName: form.fullName, phone: form.phone, city: form.city,
        };
        if (isWorker) { payload.category = form.category; payload.cnicNumber = form.cnicNumber; }
        data = await authFetch(`/auth/${role}/register`, payload);
      }
      setSuccess(`Welcome, ${data.name}!`);
      setTimeout(() => {
        login({ id: data.id, name: data.name, email: data.email, role: data.role });
        navigate(data.role === "worker" ? "/tasks" : "/");
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Solid white inputs — readable on any background
  const inputCls = "w-full px-4 py-3 rounded-xl border border-white/30 bg-white/90 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-all backdrop-blur-sm";
  const labelCls = "block text-xs font-semibold text-white/75 uppercase tracking-wider mb-1.5";

  const customerPerks = ["100% CNIC-verified workers", "Monthly & on-demand hiring", "Safe payments via platform", "Ratings & reviews system"];
  const workerPerks = ["Get hired by verified customers", "Daily & monthly job postings", "Build your verified profile", "Secure & fair payments"];
  const perks = isWorker ? workerPerks : customerPerks;

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #05091a 0%, #0b1535 45%, #06112a 100%)" }}>

      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #1E90FF 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #1E90FF 0%, transparent 70%)", transform: "translate(-50%, -50%)" }} />

      {/* Star/dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Glass card */}
      <div className="relative w-full max-w-4xl mx-4 my-8 flex rounded-3xl overflow-hidden auth-glass-card"
        style={{
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(32px) saturate(180%)",
          WebkitBackdropFilter: "blur(32px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}>

        {/* ── LEFT PANEL — branding ── */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between p-10 relative"
          style={{ borderRight: "1px solid rgba(255,255,255,0.08)", background: "rgba(30,144,255,0.07)" }}>

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg text-white"
                style={{ background: "linear-gradient(135deg, #1E90FF, #0060cc)", boxShadow: "0 4px 15px rgba(30,144,255,0.4)" }}>
                K
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                KaamWali<span className="text-blue-400">.com</span>
              </span>
            </div>
            <p className="text-white/40 text-xs mt-1">Pakistan's verified workforce platform</p>
          </div>

          {/* Role card */}
          <div className="space-y-6">
            <div className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(30,144,255,0.25)", border: "1px solid rgba(30,144,255,0.3)" }}>
                  {isWorker ? <Users className="w-4.5 h-4.5 text-blue-300" /> : <User className="w-4.5 h-4.5 text-blue-300" />}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">
                    {isWorker ? "Worker Account" : "Customer Account"}
                  </div>
                  <div className="text-blue-300/70 text-xs">
                    {isWorker ? "Find jobs near you" : "Hire trusted staff"}
                  </div>
                </div>
              </div>
              <ul className="space-y-2.5">
                {perks.map(t => (
                  <li key={t} className="flex items-center gap-2.5 text-white/65 text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400/80" />
              <span className="text-white/40 text-xs">All accounts are verified & protected</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[["5K+", "Workers"], ["12K+", "Customers"], ["98%", "Satisfied"]].map(([n, l]) => (
              <div key={l} className="rounded-xl p-3 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-white font-bold text-base">{n}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL — form ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 overflow-y-auto">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-7">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-base"
              style={{ background: "linear-gradient(135deg, #1E90FF, #0060cc)" }}>K</div>
            <span className="text-white font-bold text-lg">KaamWali<span className="text-blue-400">.com</span></span>
          </div>

          {/* Back + role badge */}
          <div className="flex items-center justify-between mb-7">
            <button onClick={() => setRole(null)}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" /> Change role
            </button>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${isWorker ? "border-orange-400/30 text-orange-300 bg-orange-400/10" : "border-blue-400/30 text-blue-300 bg-blue-400/10"}`}>
              {isWorker ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isWorker ? "Worker" : "Customer"}
            </span>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h1 className="text-xl font-bold text-white">
                {tab === "signin" ? "Welcome back" : isWorker ? "Join as a Worker" : "Create your account"}
              </h1>
            </div>
            <p className="text-white/45 text-sm">
              {tab === "signin" ? "Sign in to continue to KaamWali.com"
                : isWorker ? "Register and start finding jobs near you"
                  : "Sign up to hire verified workers today"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex rounded-xl p-1 mb-6"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {(["signin", "signup"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
                style={tab === t ? {
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.15)",
                } : { color: "rgba(255,255,255,0.45)" }}>
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5 text-sm"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#86efac" }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <>
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input className={inputCls} placeholder="e.g. Ahmed Ali" value={form.fullName} onChange={set("fullName")} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input className={inputCls} placeholder="03XX-XXXXXXX" value={form.phone} onChange={set("phone")} required />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <select className={inputCls} value={form.city} onChange={set("city")} required>
                      <option value="">Select city</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                {isWorker && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Job Category</label>
                      <select className={inputCls} value={form.category} onChange={set("category")} required>
                        <option value="">Select</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>CNIC Number</label>
                      <input className={inputCls} placeholder="XXXXX-XXXXXXX-X" value={form.cnicNumber} onChange={set("cnicNumber")} required />
                    </div>
                  </div>
                )}
                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <span className="text-white/30 text-xs uppercase tracking-widest">Credentials</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                </div>
              </>
            )}

            <div>
              <label className={labelCls}>Email Address</label>
              <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input className={`${inputCls} pr-12`} type={showPass ? "text" : "password"}
                  placeholder={tab === "signup" ? "Min. 8 characters" : "Your password"}
                  value={form.password} onChange={set("password")} required minLength={tab === "signup" ? 8 : 1} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !!success}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
              style={{
                background: "linear-gradient(135deg, #1E90FF 0%, #0060cc 100%)",
                boxShadow: "0 6px 20px rgba(30,144,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                : tab === "signin" ? "Sign In to KaamWali.com" : "Create My Account"}
            </button>
          </form>

          {/* Toggle hint */}
          <p className="text-center text-sm text-white/40 mt-5">
            {tab === "signin" ? "No account yet? " : "Already registered? "}
            <button onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
              {tab === "signin" ? "Create one →" : "Sign in →"}
            </button>
          </p>

          {tab === "signup" && isWorker && (
            <div className="mt-5 rounded-xl px-4 py-3 text-xs"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", color: "rgba(253,224,71,0.85)" }}>
              <strong>Note:</strong> Your profile will be reviewed by our admin team within 24–48 hrs before receiving job offers. You can browse tasks immediately.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
