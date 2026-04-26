import { Link } from "wouter";
import { useRole } from "./RoleContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  useListCustomers,
  useListWorkers,
  getListCustomersQueryKey,
  getListWorkersQueryKey,
} from "@workspace/api-client-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, ChevronDown, User, Users, Shield } from "lucide-react";

export function AppHeader() {
  const { role, setRole, actorId, setActorId } = useRole();

  const { data: customers } = useListCustomers({
    query: { enabled: role === "customer", queryKey: getListCustomersQueryKey() },
  });
  const { data: workers } = useListWorkers(undefined, {
    query: { enabled: role === "worker", queryKey: getListWorkersQueryKey() },
  });

  const currentCustomer = customers?.find((c) => c.id === actorId);
  const currentWorker = workers?.find((w) => w.id === actorId);

  const actorName =
    role === "admin"
      ? "Admin"
      : role === "customer"
      ? currentCustomer?.fullName || "Select Customer"
      : currentWorker?.fullName || "Select Worker";

  const renderNavLinks = () => {
    if (role === "admin") {
      return (
        <>
          <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Dashboard
          </Link>
        </>
      );
    }
    
    if (role === "worker") {
      return (
        <>
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Browse
          </Link>
          <Link href="/tasks" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Find Tasks
          </Link>
          <Link href="/bookings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            My Bookings
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
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-sm">
              V
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">VeriHire</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {renderNavLinks()}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full border-border/50 shadow-sm hover:bg-accent/50">
                <Avatar className="w-6 h-6">
                  {role === "customer" && currentCustomer?.photoUrl && <AvatarImage src={currentCustomer.photoUrl} />}
                  {role === "worker" && currentWorker?.photoUrl && <AvatarImage src={currentWorker.photoUrl} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {role === "admin" ? "A" : actorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[100px] truncate text-sm font-medium">{actorName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Current Role: <span className="capitalize text-primary">{role || "None"}</span></DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => { setRole("customer"); setActorId(null); }} className="gap-2 cursor-pointer">
                <User className="w-4 h-4" /> Switch to Customer
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setRole("worker"); setActorId(null); }} className="gap-2 cursor-pointer">
                <Users className="w-4 h-4" /> Switch to Worker
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setRole("admin"); setActorId(null); }} className="gap-2 cursor-pointer">
                <Shield className="w-4 h-4" /> Switch to Admin
              </DropdownMenuItem>

              {role === "customer" && customers && customers.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Select Profile</DropdownMenuLabel>
                  {customers.map(c => (
                    <DropdownMenuItem key={c.id} onClick={() => setActorId(c.id)} className="cursor-pointer flex justify-between">
                      <span className="truncate">{c.fullName}</span>
                      {actorId === c.id && <CheckCircle2 className="w-4 h-4 text-success" />}
                    </DropdownMenuItem>
                  ))}
                </>
              )}

              {role === "worker" && workers && workers.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Select Profile</DropdownMenuLabel>
                  {workers.map(w => (
                    <DropdownMenuItem key={w.id} onClick={() => setActorId(w.id)} className="cursor-pointer flex justify-between">
                      <span className="truncate">{w.fullName}</span>
                      {actorId === w.id && <CheckCircle2 className="w-4 h-4 text-success" />}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {role === "customer" && (
            <Link href="/tasks/new" className="hidden md:inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-full">
              Post Task
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
