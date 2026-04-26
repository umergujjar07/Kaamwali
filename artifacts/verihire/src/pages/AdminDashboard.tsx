import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  useGetAdminDashboard, 
  useListRecentActivity, 
  useGetCategoryBreakdown, 
  useListWorkers,
  useVerifyWorker,
  getGetAdminDashboardQueryKey,
  getListRecentActivityQueryKey,
  getListWorkersQueryKey,
  getGetCategoryBreakdownQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, Users, Briefcase, Star, Clock, AlertCircle, 
  CheckCircle2, XCircle, TrendingUp, Activity, UserPlus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useRole } from "@/components/RoleContext";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { role } = useRole();

  const { data: dashboard, isLoading: loadingDashboard } = useGetAdminDashboard({
    query: { enabled: role === "admin", queryKey: getGetAdminDashboardQueryKey() },
  });
  const { data: recentActivity, isLoading: loadingActivity } = useListRecentActivity({
    query: { enabled: role === "admin", queryKey: getListRecentActivityQueryKey() },
  });
  const { data: categories, isLoading: loadingCategories } = useGetCategoryBreakdown({
    query: { enabled: role === "admin", queryKey: getGetCategoryBreakdownQueryKey() },
  });
  const { data: pendingWorkers, isLoading: loadingPending } = useListWorkers(
    { verificationStatus: "pending" },
    { query: { enabled: role === "admin", queryKey: getListWorkersQueryKey({ verificationStatus: "pending" }) } },
  );

  const verifyWorker = useVerifyWorker();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = (id: number) => {
    verifyWorker.mutate({
      id,
      data: { decision: "approved" }
    }, {
      onSuccess: () => {
        toast.success("Worker approved successfully");
        invalidateAdminQueries();
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) return;

    verifyWorker.mutate({
      id: selectedWorkerId,
      data: { decision: "rejected", rejectionReason }
    }, {
      onSuccess: () => {
        toast.success("Worker application rejected");
        setRejectOpen(false);
        setSelectedWorkerId(null);
        setRejectionReason("");
        invalidateAdminQueries();
      }
    });
  };

  const invalidateAdminQueries = () => {
    queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListRecentActivityQueryKey() });
    queryClient.invalidateQueries({ queryKey: getListWorkersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetCategoryBreakdownQueryKey() });
  };

  if (role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md border-2 border-dashed rounded-3xl mt-12 bg-muted/10">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You must be logged in as an Admin to view this dashboard.</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, highlight = false }: any) => (
    <Card className={`border-border shadow-sm overflow-hidden relative group ${highlight ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-2">
            <p className={`text-sm font-semibold uppercase tracking-wider ${highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{title}</p>
            <p className="text-4xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className={`text-xs flex items-center gap-1 font-medium ${highlight ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-2xl ${highlight ? 'bg-background/20' : colorClass}`}>
            <Icon className={`w-6 h-6 ${highlight ? 'text-primary-foreground' : ''}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'worker_registered': return <UserPlus className="w-4 h-4 text-primary" />;
      case 'worker_verified': return <ShieldCheck className="w-4 h-4 text-success" />;
      case 'worker_rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'booking_created': return <Briefcase className="w-4 h-4 text-primary" />;
      case 'task_created': return <Clock className="w-4 h-4 text-warning" />;
      case 'task_accepted': return <UserPlus className="w-4 h-4 text-primary" />;
      case 'task_completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'review_created': return <Star className="w-4 h-4 text-warning" />;
      default: return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8 bg-muted/5 min-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
      </div>

      {loadingDashboard ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pending Workers" value={dashboard.pendingWorkers} subtitle="Requires manual review" icon={Clock} colorClass="bg-warning/10 text-warning" highlight={dashboard.pendingWorkers > 0} />
          <StatCard title="Approved Workers" value={dashboard.approvedWorkers} subtitle={`Out of ${dashboard.totalWorkers} total`} icon={ShieldCheck} colorClass="bg-success/10 text-success" />
          <StatCard title="Total Customers" value={dashboard.totalCustomers} icon={Users} colorClass="bg-primary/10 text-primary" />
          <StatCard title="Active Bookings" value={dashboard.activeBookings} icon={Briefcase} colorClass="bg-primary/10 text-primary" />
          <StatCard title="Open Tasks" value={dashboard.openTasks} icon={AlertCircle} colorClass="bg-warning/10 text-warning" />
          <StatCard title="Completed Tasks" value={dashboard.completedTasks} icon={CheckCircle2} colorClass="bg-success/10 text-success" />
          <StatCard title="Rejected Workers" value={dashboard.rejectedWorkers} icon={XCircle} colorClass="bg-destructive/10 text-destructive" />
          <StatCard title="Avg Rating" value={dashboard.averageRating.toFixed(1)} subtitle={`${dashboard.totalReviews} total reviews`} icon={Star} colorClass="bg-warning/10 text-warning" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left Col: Pending Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-md overflow-hidden">
            <CardHeader className="bg-muted/20 border-b pb-4 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-warning" /> Pending Verifications
                  {pendingWorkers && pendingWorkers.length > 0 && (
                    <Badge variant="destructive" className="rounded-full px-2 py-0.5 ml-2">{pendingWorkers.length}</Badge>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loadingPending ? (
                <div className="p-6 space-y-4">
                  {[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
              ) : pendingWorkers && pendingWorkers.length > 0 ? (
                <div className="divide-y">
                  {pendingWorkers.map(worker => (
                    <div key={worker.id} className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 border shadow-sm">
                          {worker.photoUrl ? <AvatarImage src={worker.photoUrl} className="object-cover" /> : null}
                          <AvatarFallback className="font-semibold">{worker.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-lg leading-tight">{worker.fullName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <span className="capitalize font-medium text-primary">{worker.category}</span>
                            <span>•</span>
                            <span>{worker.city}</span>
                            <span>•</span>
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{worker.cnicNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" className="rounded-xl flex-1 sm:flex-none" onClick={() => navigate(`/admin/workers/${worker.id}`)}>
                          View Full
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-success hover:bg-success/90 text-success-foreground rounded-xl flex-1 sm:flex-none shadow-sm"
                          onClick={() => handleApprove(worker.id)}
                          disabled={verifyWorker.isPending}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="rounded-xl flex-1 sm:flex-none shadow-sm"
                          onClick={() => { setSelectedWorkerId(worker.id); setRejectOpen(true); }}
                          disabled={verifyWorker.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <p className="font-medium text-lg text-foreground">All caught up!</p>
                  <p>No pending workers require verification right now.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Chart */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 h-72">
              {loadingCategories ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : categories && categories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} dy={10} style={{ textTransform: 'capitalize' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: "hsl(var(--muted-foreground))"}} />
                    <Tooltip 
                      cursor={{fill: "hsl(var(--muted)/0.5)"}} 
                      contentStyle={{borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    />
                    <Bar dataKey="count" name="Total" radius={[4, 4, 0, 0]}>
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--primary))" fillOpacity={0.6} />
                      ))}
                    </Bar>
                    <Bar dataKey="approved" name="Approved" radius={[4, 4, 0, 0]}>
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="hsl(var(--success))" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="border-border shadow-sm h-[calc(100vh-14rem)] sticky top-20 flex flex-col">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Live Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-auto flex-1 custom-scrollbar">
              {loadingActivity ? (
                <div className="p-6 space-y-6">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-2/3" /></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity && recentActivity.length > 0 ? (
                <div className="p-6">
                  <div className="relative border-l-2 border-muted/50 ml-4 space-y-8">
                    {recentActivity.map((activity, index) => (
                      <div key={activity.id} className="relative pl-6">
                        <div className="absolute -left-[21px] top-1 w-10 h-10 bg-card border rounded-full flex items-center justify-center shadow-sm z-10">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="space-y-1 bg-muted/20 p-4 rounded-xl border border-border/50 shadow-sm ml-2 hover:bg-muted/40 transition-colors">
                          <p className="text-sm font-semibold text-foreground leading-tight">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/40">
                            <span className="text-xs font-medium text-primary">{activity.actorName}</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">No recent activity</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Reject Worker Application
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection <span className="text-destructive">*</span></Label>
              <Textarea 
                id="reason" 
                value={rejectionReason} 
                onChange={e => setRejectionReason(e.target.value)} 
                placeholder="Explain why this profile is not being approved..." 
                required
                className="h-32"
              />
              <p className="text-xs text-muted-foreground">This will be visible to the worker so they can fix issues and reapply.</p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={verifyWorker.isPending} className="rounded-xl">
                {verifyWorker.isPending ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
