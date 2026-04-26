import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetWorker, 
  useVerifyWorker, 
  getGetWorkerQueryKey,
  getListWorkersQueryKey,
  getGetAdminDashboardQueryKey
} from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { 
  ShieldCheck, MapPin, Clock, AlertCircle, XCircle, ArrowLeft, 
  CreditCard, Phone, User
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminWorkerReview() {
  const params = useParams<{ id: string }>();
  const workerId = parseInt(params.id || "0", 10);
  const { role } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: worker, isLoading, error } = useGetWorker(workerId, {
    query: { enabled: !!workerId && role === "admin", queryKey: getGetWorkerQueryKey(workerId) },
  });
  const verifyWorker = useVerifyWorker();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = () => {
    verifyWorker.mutate({ id: workerId, data: { decision: "approved" } }, {
      onSuccess: () => {
        toast.success("Worker verified successfully");
        queryClient.invalidateQueries({ queryKey: getListWorkersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        navigate("/admin");
      }
    });
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    verifyWorker.mutate({ id: workerId, data: { decision: "rejected", rejectionReason } }, {
      onSuccess: () => {
        toast.success("Application rejected");
        setRejectOpen(false);
        queryClient.invalidateQueries({ queryKey: getListWorkersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
        navigate("/admin");
      }
    });
  };

  if (role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive">Admin Access Required</h2>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12 max-w-4xl"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  }

  if (error || !worker) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Worker not found</h2>
        <Button className="mt-6 rounded-xl" onClick={() => navigate("/admin")}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Review Application
            {worker.verificationStatus === "pending" && <Badge variant="outline" className="bg-warning/10 text-warning border-warning/50">Pending</Badge>}
            {worker.verificationStatus === "approved" && <Badge className="bg-success text-success-foreground border-success">Approved</Badge>}
            {worker.verificationStatus === "rejected" && <Badge variant="destructive">Rejected</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1">Submitted on {format(new Date(worker.createdAt), "PPP")}</p>
        </div>

        {worker.verificationStatus === "pending" && (
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="destructive" 
              className="rounded-xl flex-1 md:flex-none px-8 shadow-sm"
              onClick={() => setRejectOpen(true)}
              disabled={verifyWorker.isPending}
            >
              Reject
            </Button>
            <Button 
              className="bg-success hover:bg-success/90 text-success-foreground rounded-xl flex-1 md:flex-none px-8 shadow-sm gap-2"
              onClick={handleApprove}
              disabled={verifyWorker.isPending}
            >
              <ShieldCheck className="w-4 h-4" /> Approve
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 shadow-md bg-muted">
                  {worker.photoUrl ? <AvatarImage src={worker.photoUrl} className="object-cover" /> : null}
                  <AvatarFallback className="text-4xl text-muted-foreground">
                    {worker.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1">
                  <div>
                    <h2 className="text-2xl font-bold">{worker.fullName}</h2>
                    <p className="text-primary font-semibold capitalize tracking-wide">{worker.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm text-foreground/80 mt-4">
                    <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                      <Phone className="w-4 h-4 text-muted-foreground" /> <span className="font-mono">{worker.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> <span>{worker.city} {worker.serviceArea && `(${worker.serviceArea})`}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                      <Clock className="w-4 h-4 text-muted-foreground" /> <span>{worker.experienceYears} Years Exp</span>
                    </div>
                    <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg border">
                      <CreditCard className="w-4 h-4 text-muted-foreground" /> 
                      <span className="font-semibold text-foreground">
                        {worker.expectedMonthlySalary ? `Rs. ${worker.expectedMonthlySalary.toLocaleString()}/mo` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3 pt-6 border-t">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" /> Bio & Skills
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{worker.bio || "No bio provided."}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {worker.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="px-3 rounded-full">{skill}</Badge>
                  ))}
                  {worker.skills.length === 0 && <span className="text-sm italic text-muted-foreground">No skills listed</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Focus */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-warning/30 bg-warning/5 shadow-md">
            <CardHeader className="pb-3 border-b border-warning/10">
              <CardTitle className="text-lg flex items-center gap-2 text-warning-foreground font-bold">
                <ShieldCheck className="w-5 h-5" /> Identity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Provided CNIC Number</Label>
                <div className="bg-background border border-warning/20 p-3 rounded-xl font-mono text-lg text-center tracking-widest font-bold shadow-sm">
                  {worker.cnicNumber}
                </div>
              </div>
              
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">CNIC Document</Label>
                {worker.cnicImageUrl ? (
                  <div className="rounded-xl overflow-hidden border-2 border-warning/20 bg-muted/50 p-2">
                    {/* Just displaying the image directly since it's a URL in this mockup */}
                    <img 
                      src={worker.cnicImageUrl} 
                      alt="CNIC Document" 
                      className="w-full h-auto object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden py-8 text-center text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Image URL invalid or broken</p>
                      <p className="text-xs mt-1 break-all px-4">{worker.cnicImageUrl}</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-warning/30 rounded-xl text-center bg-background">
                    <XCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No document image provided</p>
                  </div>
                )}
              </div>

              {worker.verificationStatus === "rejected" && worker.rejectionReason && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-destructive mb-1">Rejection Reason</h4>
                  <p className="text-sm text-destructive-foreground">{worker.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Reject Application
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReject} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for rejection (Required)</Label>
              <Textarea 
                id="reason" 
                value={rejectionReason} 
                onChange={e => setRejectionReason(e.target.value)} 
                placeholder="e.g. CNIC photo is blurry, details don't match..." 
                required
                className="h-32"
              />
              <p className="text-xs text-muted-foreground">The worker will see this reason so they can correct the issue.</p>
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
