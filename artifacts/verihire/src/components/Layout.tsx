import { useLocation } from "wouter";
import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";
import { useRole } from "./RoleContext";
import { Dialog, DialogContent } from "./ui/dialog";
import { Shield, User, Users, ChevronRight } from "lucide-react";
import AuthPage from "@/pages/AuthPage";

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, isAuthenticated, isReady } = useRole();
  const [location] = useLocation();

  if (!isReady) return null;

  // Step 2: role chosen but not authenticated → full-screen auth (admin skips)
  if (role && role !== "admin" && !isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <AppHeader />

      {/* Page content — re-keyed on route change to trigger fade-in animation */}
      <main key={location} className="flex-1 flex flex-col page-animate">
        {children}
      </main>

      <Footer />

      {/* Step 1: no role yet → compact role picker */}
      <Dialog open={!role} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden [&>button]:hidden" aria-describedby={undefined}>
          <div className="sr-only">KaamWali.com — Choose your role</div>

          {/* Blue gradient header */}
          <div className="bg-gradient-to-br from-primary to-blue-600 px-6 py-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <h2 className="text-lg font-bold text-white">KaamWali.com</h2>
            <p className="text-white/75 text-xs mt-0.5">Who are you?</p>
          </div>

          {/* Role options */}
          <div className="p-4 space-y-2">
            <button
              onClick={() => setRole("customer")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 bg-white hover:border-primary hover:bg-blue-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">I am a Customer</div>
                <div className="text-xs text-gray-400 truncate">Hire verified maids, drivers & more</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
            </button>

            <button
              onClick={() => setRole("worker")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-100 bg-white hover:border-primary hover:bg-blue-50 transition-all group text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm">I am a Worker</div>
                <div className="text-xs text-gray-400 truncate">Find jobs and build a verified profile</div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
            </button>

            <div className="pt-1">
              <button
                onClick={() => setRole("admin")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Shield className="w-3 h-3" /> Administrator access
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
