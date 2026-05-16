import { useState } from "react";
import { useListBookings } from "@workspace/api-client-react";
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

const STATUSES = ["all", "active", "completed", "cancelled"] as const;

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20"><CheckCircle className="w-2.5 h-2.5" />Active</span>;
  if (status === "completed") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20"><CheckCircle className="w-2.5 h-2.5" />Completed</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20"><XCircle className="w-2.5 h-2.5" />Cancelled</span>;
}

export default function Bookings() {
  const [statusFilter, setStatusFilter] = useState<typeof STATUSES[number]>("all");
  const [search, setSearch] = useState("");

  const { data: bookings, isLoading } = useListBookings(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const filtered = (bookings ?? []).filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.worker?.fullName?.toLowerCase().includes(q) ||
      b.customer?.fullName?.toLowerCase().includes(q) ||
      String(b.id).includes(q)
    );
  });

  const totalSalary = filtered.filter(b => b.status === "active").reduce((s, b) => s + b.monthlySalary, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">All monthly hire arrangements</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUSES.filter(s => s !== "all").map(s => {
          const count = (bookings ?? []).filter(b => b.status === s).length;
          return (
            <div key={s} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground capitalize mt-0.5">{s}</div>
            </div>
          );
        })}
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <div className="text-xl font-bold text-foreground">PKR {(totalSalary / 1000).toFixed(0)}k</div>
          <div className="text-xs text-muted-foreground mt-0.5">Active payroll/mo</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by worker or customer name..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-secondary/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div>Worker</div>
          <div>Customer</div>
          <div>Salary/mo</div>
          <div>Start</div>
          <div>Status</div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No bookings found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(b => (
              <div key={b.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3 hover:bg-accent/30 transition-colors">
                <div>
                  <div className="text-sm font-medium text-foreground">{b.worker?.fullName ?? `Worker #${b.workerId}`}</div>
                  <div className="text-xs text-muted-foreground sm:hidden">{b.customer?.fullName ?? `Customer #${b.customerId}`}</div>
                </div>
                <div className="hidden sm:block text-sm text-foreground">{b.customer?.fullName ?? `Customer #${b.customerId}`}</div>
                <div className="text-sm text-foreground font-medium">PKR {b.monthlySalary.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(b.startDate), "MMM d, yyyy")}</div>
                <div><StatusBadge status={b.status} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
