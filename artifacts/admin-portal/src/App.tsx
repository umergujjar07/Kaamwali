import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Dashboard from "@/pages/Dashboard";
import VerificationQueue from "@/pages/VerificationQueue";
import WorkerDetail from "@/pages/WorkerDetail";
import Workers from "@/pages/Workers";
import Bookings from "@/pages/Bookings";
import Tasks from "@/pages/Tasks";
import Customers from "@/pages/Customers";
import Activity from "@/pages/Activity";
import { Shield, LayoutDashboard, CheckCircle, Users, Briefcase, ClipboardList, UserCheck, Activity as ActivityIcon, LogOut, Menu, X } from "lucide-react";

const ADMIN_PASSWORD = "VH@Admin2026";
const SESSION_KEY = "kw_admin_auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "1");
        onLogin();
      } else {
        setError("Invalid password. Access denied.");
        setPw("");
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-lg text-foreground">KaamWali Admin</div>
            <div className="text-xs text-muted-foreground">Restricted access</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <h1 className="text-base font-semibold text-foreground mb-1">Sign in</h1>
          <p className="text-xs text-muted-foreground mb-5">Enter the admin password to access the control panel.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={pw}
                onChange={e => { setPw(e.target.value); setError(""); }}
                placeholder="••••••••••••"
                autoFocus
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !pw}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Access Admin Panel"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          This portal is restricted to authorized administrators only.
        </p>
      </div>
    </div>
  );
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/verify", label: "Verification Queue", icon: CheckCircle, badge: true },
  { href: "/workers", label: "All Workers", icon: Users },
  { href: "/bookings", label: "Bookings", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/customers", label: "Customers", icon: UserCheck },
  { href: "/activity", label: "Activity Feed", icon: ActivityIcon },
];

function Sidebar({ onLogout, mobile, onClose }: { onLogout: () => void; mobile?: boolean; onClose?: () => void }) {
  const [location] = useLocation();

  return (
    <div className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border ${mobile ? "w-72" : "w-60"}`}>
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-sidebar-foreground">KaamWali Admin</div>
            <div className="text-xs text-muted-foreground">Control Panel</div>
          </div>
          {mobile && (
            <button onClick={onClose} className="text-muted-foreground hover:text-sidebar-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

function AdminLayout({ onLogout, children }: { onLogout: () => void; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar onLogout={onLogout} />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0">
            <Sidebar onLogout={onLogout} mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-foreground">KaamWali Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router({ onLogout }: { onLogout: () => void }) {
  return (
    <AdminLayout onLogout={onLogout}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/verify" component={VerificationQueue} />
        <Route path="/verify/:id" component={WorkerDetail} />
        <Route path="/workers" component={Workers} />
        <Route path="/workers/:id" component={WorkerDetail} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/customers" component={Customers} />
        <Route path="/activity" component={Activity} />
        <Route>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Page not found</div>
        </Route>
      </Switch>
    </AdminLayout>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") setAuthed(true);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  if (!authed) return <LoginPage onLogin={() => setAuthed(true)} />;

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router onLogout={handleLogout} />
      </WouterRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
