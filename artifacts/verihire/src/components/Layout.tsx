import { useLocation } from "wouter";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";
import { useRole } from "./RoleContext";
import { Shield, User, Users, ChevronRight, ShieldCheck } from "lucide-react";
import AuthPage from "@/pages/AuthPage";

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, isAuthenticated, isReady } = useRole();
  const [location] = useLocation();

  if (!isReady) return null;

  if (role && role !== "admin" && !isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <AppHeader />
      <main key={location} className="flex-1 flex flex-col page-animate">
        {children}
      </main>
      <Footer />

      {/* Glassy role picker — custom overlay, bypasses [role="dialog"] solid-white override */}
      {!role && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred dark backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(5, 9, 26, 0.72)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />

          {/* Glass card */}
          <div
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Ambient glow top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(30,144,255,0.35) 0%, transparent 70%)",
              }}
            />

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center">
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center font-bold text-2xl text-white"
                style={{
                  background: "linear-gradient(135deg, #1E90FF, #0060cc)",
                  boxShadow: "0 6px 20px rgba(30,144,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                K
              </div>
              <h2 className="text-xl font-bold text-white mb-1">KaamWali.com</h2>
              <p className="text-white/50 text-sm">Select your role to continue</p>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />

            {/* Role buttons */}
            <div className="p-5 space-y-3">
              {[
                {
                  role: "customer" as const,
                  icon: <User className="w-5 h-5 text-blue-300" />,
                  title: "I am a Customer",
                  desc: "Hire verified maids, drivers & more",
                  color: "rgba(30,144,255,0.18)",
                  border: "rgba(30,144,255,0.35)",
                  glow: "rgba(30,144,255,0.15)",
                },
                {
                  role: "worker" as const,
                  icon: <Users className="w-5 h-5 text-emerald-300" />,
                  title: "I am a Worker",
                  desc: "Find jobs and build a verified profile",
                  color: "rgba(16,185,129,0.15)",
                  border: "rgba(16,185,129,0.3)",
                  glow: "rgba(16,185,129,0.12)",
                },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => setRole(item.role)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 group"
                  style={{
                    background: item.color,
                    border: `1px solid ${item.border}`,
                    boxShadow: `0 4px 16px ${item.glow}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = item.color.replace("0.18", "0.28").replace("0.15", "0.25");
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = item.color;
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm">{item.title}</div>
                    <div className="text-white/50 text-xs mt-0.5 truncate">{item.desc}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Trust badge + admin */}
            <div className="px-5 pb-5 space-y-3">
              <div
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="text-white/40 text-xs">All workers are CNIC verified</span>
              </div>

              <button
                onClick={() => setRole("admin")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                <Shield className="w-3 h-3" /> Administrator access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
