import { useState } from "react";
import { useListTasks } from "@workspace/api-client-react";
import { Search } from "lucide-react";
import { format } from "date-fns";

const STATUSES = ["all", "open", "accepted", "in_progress", "completed", "cancelled"] as const;
const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  accepted: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
  in_progress: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-secondary text-muted-foreground border-border";
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>{status.replace("_", " ")}</span>;
}

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<typeof STATUSES[number]>("all");
  const [search, setSearch] = useState("");

  const { data: tasks, isLoading } = useListTasks(
    statusFilter !== "all" ? { status: statusFilter } : undefined
  );

  const filtered = (tasks ?? []).filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.city.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
  });

  const totalBudget = filtered.filter(t => t.status === "open").reduce((s, t) => s + t.budget, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">On-demand task listings across the platform</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {STATUSES.filter(s => s !== "all").map(s => {
          const count = (tasks ?? []).filter(t => t.status === s).length;
          return (
            <div key={s} className={`bg-card border rounded-xl p-3 text-center cursor-pointer transition-colors ${statusFilter === s ? "border-primary" : "border-border hover:border-border/80"}`} onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}>
              <div className="text-lg font-bold text-foreground">{count}</div>
              <div className="text-xs text-muted-foreground capitalize mt-0.5">{s.replace("_", " ")}</div>
            </div>
          );
        })}
      </div>

      {totalBudget > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
          <div className="text-xs text-blue-400">Total open task budget: <span className="font-semibold">PKR {totalBudget.toLocaleString()}</span></div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, city, category..."
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
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-4 py-2.5 bg-secondary/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <div>Task</div>
          <div>Location</div>
          <div>Budget</div>
          <div>Posted</div>
          <div>Status</div>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No tasks found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(t => (
              <div key={t.id} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-foreground">{t.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{t.category} · {t.durationHours}h</div>
                </div>
                <div className="text-sm text-foreground">{t.city}</div>
                <div className="text-sm font-medium text-foreground whitespace-nowrap">PKR {t.budget.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(t.createdAt), "MMM d")}</div>
                <div><StatusBadge status={t.status} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
