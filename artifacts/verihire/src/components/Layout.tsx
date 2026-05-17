import { AppHeader } from "./AppHeader";
import { Footer } from "./Footer";
import { useRole } from "./RoleContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Shield, User, Users } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, isReady } = useRole();

  if (!isReady) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background font-sans">
      <AppHeader />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />

      <Dialog open={!role} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center mb-2">Welcome to KaamWali.com</DialogTitle>
            <DialogDescription className="text-center text-base">
              Choose your role to get started. You can switch anytime from the top menu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 mt-4">
            <Button 
              variant="outline" 
              className="h-auto py-6 px-4 justify-start gap-4 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => setRole("customer")}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base mb-1">I am a Customer</div>
                <div className="text-sm text-muted-foreground whitespace-normal leading-relaxed">
                  I want to hire verified maids, drivers, cooks, and other services.
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-6 px-4 justify-start gap-4 hover:border-primary hover:bg-primary/5 transition-all"
              onClick={() => setRole("worker")}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-base mb-1">I am a Service Worker</div>
                <div className="text-sm text-muted-foreground whitespace-normal leading-relaxed">
                  I want to find secure jobs and build a verified profile.
                </div>
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="text-muted-foreground text-xs mt-2"
              onClick={() => setRole("admin")}
            >
              <Shield className="w-3 h-3 mr-2" /> Log in as Administrator
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
