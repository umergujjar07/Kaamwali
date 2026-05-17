import { useState } from "react";
import { useLocation } from "wouter";
import { useRole } from "@/components/RoleContext";
import { ShieldCheck, Eye, EyeOff, ArrowLeft, User, Users, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

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
    setError("");
    setSuccess("");
    setLoading(true);
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
      }, 600);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E90FF 0%, #0060cc 60%, #004499 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        {/* Logo */}
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="text-white font-bold text-2xl">KaamWali<span className="text-blue-200">.com</span></span>
          </div>
          <p className="text-blue-100 text-sm">Pakistan's most trusted workforce platform</p>
        </div>

        {/* Role badge */}
        <div className="relative space-y-8">
          <div className="bg-white/15 backdrop-blur rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {isWorker ? <Users className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
              </div>
              <div>
                <div className="text-white font-semibold">
                  {isWorker ? "Service Worker Account" : "Customer Account"}
                </div>
                <div className="text-blue-200 text-xs">
                  {isWorker ? "Find jobs near you" : "Hire trusted workers"}
                </div>
              </div>
            </div>
            {isWorker ? (
              <ul className="space-y-2">
                {["Get hired by verified customers", "Daily & monthly job opportunities", "Build your verified profile", "Secure payments, no fraud"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-blue-100 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2">
                {["100% CNIC-verified workers only", "Instant & monthly hiring", "Safe payments via platform", "Ratings & reviews system"].map(t => (
                  <li key={t} className="flex items-center gap-2 text-blue-100 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-300 flex-shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-300" />
            <span className="text-blue-100 text-xs">All accounts are protected and verified</span>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[["5,000+", "Workers"], ["12,000+", "Customers"], ["98%", "Satisfaction"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-white font-bold text-xl">{n}</div>
              <div className="text-blue-200 text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="font-bold text-xl">KaamWali<span className="text-primary">.com</span></span>
          </div>

          {/* Back + role indicator */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setRole(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Change role
            </button>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${isWorker ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-blue-50 text-blue-600 border border-blue-200"}`}>
              {isWorker ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {isWorker ? "Worker" : "Customer"}
            </span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {tab === "signin" ? "Welcome back" : isWorker ? "Join as a Worker" : "Create your account"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {tab === "signin"
                ? "Sign in to continue to KaamWali.com"
                : isWorker
                  ? "Register and start finding jobs near you"
                  : "Sign up to hire trusted workers today"}
            </p>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-7">
            {(["signin", "signup"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm">
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
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Job Category</label>
                      <select className={inputCls} value={form.category} onChange={set("category")} required>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>CNIC Number</label>
                      <input className={inputCls} placeholder="XXXXX-XXXXXXX-X" value={form.cnicNumber} onChange={set("cnicNumber")} required />
                    </div>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-400 mb-4 font-medium uppercase tracking-wide">Account credentials</p>
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
                  placeholder={tab === "signup" ? "Min. 8 characters" : "Enter your password"}
                  value={form.password} onChange={set("password")} required minLength={tab === "signup" ? 8 : 1} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !!success}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #1E90FF, #0060cc)", boxShadow: "0 4px 15px rgba(30,144,255,0.35)" }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                : tab === "signin" ? "Sign In to KaamWali.com" : "Create My Account"}
            </button>
          </form>

          {/* Toggle hint */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {tab === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-primary font-semibold hover:underline">
              {tab === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>

          {tab === "signup" && isWorker && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
              <strong>Note:</strong> Your profile will be reviewed by our admin team within 24-48 hours before you can receive job offers. You can browse tasks immediately.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
