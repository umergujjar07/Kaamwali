import { useGetAdminDashboard, useGetCategoryBreakdown, useListWorkers } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, CheckCircle, Clock, Star, Briefcase, ClipboardList, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "wouter";

function StatCard({ label, value, icon: Icon, color, sub }: { label: string; value: string | number; icon: any; color: string; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/70 mt-1">{sub}</div>}
    </div>
  );
}

const CATEGORY_COLORS = ["#1E90FF", "#32CD32", "#FF8C00", "#A855F7", "#EC4899", "#14B8A6", "#F59E0B"];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetAdminDashboard();
  const { data: breakdown } = useGetCategoryBreakdown();
  const { data: pending } = useListWorkers({ verificationStatus: "pending" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground text-sm">Loading dashboard...</div>
      </div>
    );
  }

  const pendingCount = pending?.length ?? stats?.pendingWorkers ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform overview and key metrics</p>
      </div>

      {pendingCount > 0 && (
        <Link href="/verify">
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 cursor-pointer hover:bg-amber-500/15 transition-colors">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-amber-300">{pendingCount} worker{pendingCount !== 1 ? "s" : ""} awaiting CNIC verification</span>
              <span className="text-xs text-amber-400/70 ml-2">Click to review</span>
            </div>
          </div>
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Workers" value={stats?.totalWorkers ?? 0} icon={Users} color="bg-blue-500/15 text-blue-400" />
        <StatCard label="Verified Workers" value={stats?.approvedWorkers ?? 0} icon={CheckCircle} color="bg-green-500/15 text-green-400" sub={stats?.totalWorkers ? `${Math.round(((stats.approvedWorkers ?? 0) / stats.totalWorkers) * 100)}% of total` : undefined} />
        <StatCard label="Pending Review" value={pendingCount} icon={Clock} color="bg-amber-500/15 text-amber-400" />
        <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} icon={Users} color="bg-purple-500/15 text-purple-400" />
        <StatCard label="Active Bookings" value={stats?.activeBookings ?? 0} icon={Briefcase} color="bg-cyan-500/15 text-cyan-400" />
        <StatCard label="Open Tasks" value={stats?.openTasks ?? 0} icon={ClipboardList} color="bg-orange-500/15 text-orange-400" />
        <StatCard label="Completed Tasks" value={stats?.completedTasks ?? 0} icon={TrendingUp} color="bg-indigo-500/15 text-indigo-400" />
        <StatCard label="Avg. Rating" value={stats?.averageRating ? `${stats.averageRating.toFixed(1)}★` : "—"} icon={Star} color="bg-yellow-500/15 text-yellow-400" />
      </div>

      {breakdown && breakdown.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Workers by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={breakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#cbd5e1" }}
                itemStyle={{ color: "#94a3b8" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {breakdown.map((_, i) => (
                  <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/verify">
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Verification Queue</h2>
            </div>
            <p className="text-xs text-muted-foreground">Review worker CNIC submissions and approve or reject profiles.</p>
            <div className="mt-3 text-xs text-primary group-hover:underline">Go to queue →</div>
          </div>
        </Link>
        <Link href="/activity">
          <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            </div>
            <p className="text-xs text-muted-foreground">View the latest platform events, registrations, and transactions.</p>
            <div className="mt-3 text-xs text-primary group-hover:underline">View feed →</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
