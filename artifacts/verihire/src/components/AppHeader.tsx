import { Link, useLocation } from "wouter";
import { useRole } from "./RoleContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Users, ChevronDown, ShieldCheck, ArrowLeft } from "lucide-react";

export function AppHeader() {
  const { role, user, logout } = useRole();
  const [location, navigate] = useLocation();

  const homeRoute = role === "worker" ? "/tasks" : "/";
  const isHome = location === "/" || location === "/tasks";
  const canGoBack = !isHome;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const renderNavLinks = () => {
    if (role === "admin") {
      return (
        <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          Dashboard
        </Link>
      );
    }
    if (role === "worker") {
      return (
        <>
          <Link href="/tasks" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Find Tasks
          </Link>
          <Link href="/bookings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            My Bookings
          </Link>
          <Link href="/workers/new" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            My Profile
          </Link>
        </>
      );
    }
    return (
      <>
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          Browse Workers
        </Link>
        <Link href="/tasks" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          Task Board
        </Link>
        <Link href="/bookings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          My Hires
        </Link>
        <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          About
        </Link>
      </>
    );
  };

  const displayName = user?.name ?? (role === "admin" ? "Admin" : "Account");
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/30 bg-white/60 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Left side: back button + logo + nav */}
        <div className="flex items-center gap-3">
          {/* Back button */}
          {canGoBack && (
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-border/60 bg-background/60 hover:bg-accent/60 transition-all shadow-sm group flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          )}

          <Link href={homeRoute} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm">
              K
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              KaamWali<span className="text-primary">.com</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-4">
            {renderNavLinks()}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {role === "customer" && (
            <Link
              href="/tasks/new"
              className="hidden md:inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-full transition-colors"
            >
              Post Task
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full border-border/50 shadow-sm hover:bg-accent/50 h-9 px-3">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[110px] truncate text-sm font-medium hidden sm:block">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="flex items-center gap-2 py-2">
                {role === "customer" && <User className="w-4 h-4 text-primary flex-shrink-0" />}
                {role === "worker" && <Users className="w-4 h-4 text-primary flex-shrink-0" />}
                {role === "admin" && <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />}
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{displayName}</div>
                  {user?.email && <div className="text-xs text-muted-foreground truncate">{user.email}</div>}
                  {role === "admin" && <div className="text-xs text-muted-foreground">Administrator</div>}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
