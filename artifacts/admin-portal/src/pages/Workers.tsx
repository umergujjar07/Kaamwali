import { useState } from "react";
import { useListWorkers } from "@workspace/api-client-react";
import { Search, CheckCircle, XCircle, Clock, Star, ChevronRight, Filter } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const CATEGORIES = ["all", "maid", "driver", "guard", "cook", "nanny", "gardener", "other"];
const STATUSES = ["all", "pending", "approved", "rejected"] as const;
const CATEGORY_LABELS: Record<string, string> = { all: "All", maid: "Maid", driver: "Driver", guard: "Guard", cook: "Cook", nanny: "Nanny", gardener: "Gardener", other: "Other" };

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20"><CheckCircle className="w-2.5 h-2.5" />Approved</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20"><XCircle className="w-2.5 h-2.5" />Rejected</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20"><Clock className="w-2.5 h-2.5" />Pending</span>;
}

export default function Workers() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<typeof STATUSES[number]>("all");

  const { data: workers, isLoading } = useListWorkers(
    status !== "all" ? { verificationStatus: status } : undefined
  );

  const filtered = (workers ?? []).filter(w => {
    if (category !== "all" && w.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return w.fullName.toLowerCase().includes(q) || w.city.toLowerCase().includes(q) || w.cnicNumber.includes(q) || w.phone.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">All Workers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage and review worker profiles</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, city, CNIC..."
            className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <select
            value={status}
            onChange={e => setStatus(e.target.value as typeof STATUSES[number])}
            className="bg-card border border-border rounded-lg text-sm text-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground border border-border"}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">{isLoading ? "Loading..." : `${filtered.length} worker${filtered.length !== 1 ? "s" : ""}`}</div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading workers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No workers found.</div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(w => (
              <Link key={w.id} href={`/workers/${w.id}`}>
                <div className="flex items-center gap-4 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                    {w.photoUrl
                      ? <img src={w.photoUrl} alt={w.fullName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">{w.fullName.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground truncate">{w.fullName}</span>
                      <StatusBadge status={w.verificationStatus} />
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {CATEGORY_LABELS[w.category] ?? w.category} · {w.city} · CNIC {w.cnicNumber}
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 flex-shrink-0 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{w.averageRating.toFixed(1)}</div>
                    <div>{w.completedJobs} jobs</div>
                    <div>{format(new Date(w.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
