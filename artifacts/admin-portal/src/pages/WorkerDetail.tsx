import { useParams, useLocation } from "wouter";
import { useGetWorker, useVerifyWorker, useListWorkerReviews, getListWorkersQueryKey, getGetWorkerQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, User, Phone, MapPin, Star, Briefcase, Clock, Shield, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const CATEGORY_LABELS: Record<string, string> = {
  maid: "Maid", driver: "Driver", guard: "Guard",
  cook: "Cook", nanny: "Nanny", gardener: "Gardener", other: "Other",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3" />Approved</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" />Rejected</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" />Pending Review</span>;
}

export default function WorkerDetail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const id = Number(params.id);
  const qc = useQueryClient();

  const { data: worker, isLoading } = useGetWorker(id, { query: { enabled: !!id, queryKey: getGetWorkerQueryKey(id) } });
  const { data: reviews } = useListWorkerReviews(id, { query: { enabled: !!id, queryKey: ["workerReviews", id] } });
  const verifyMutation = useVerifyWorker();

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleVerify = async (decision: "approved" | "rejected") => {
    if (decision === "rejected" && !rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      await verifyMutation.mutateAsync({
        id,
        data: { decision, rejectionReason: decision === "rejected" ? rejectReason : null },
      });
      qc.invalidateQueries({ queryKey: getListWorkersQueryKey() });
      qc.invalidateQueries({ queryKey: getGetWorkerQueryKey(id) });
      toast.success(decision === "approved" ? "Worker approved successfully." : "Worker rejected.");
      navigate("/verify");
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-muted-foreground text-sm">Loading worker...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-sm">Worker not found.</div>
        <Link href="/verify"><div className="text-primary text-sm mt-2 hover:underline cursor-pointer">Back to queue</div></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/verify">
          <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Worker Profile Review</h1>
          <p className="text-sm text-muted-foreground">ID #{worker.id}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex-shrink-0">
            {worker.photoUrl
              ? <img src={worker.photoUrl} alt={worker.fullName} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground">{worker.fullName.charAt(0)}</div>
            }
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-foreground">{worker.fullName}</h2>
                <div className="text-sm text-muted-foreground">{CATEGORY_LABELS[worker.category] ?? worker.category}</div>
              </div>
              <StatusBadge status={worker.verificationStatus} />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3.5 h-3.5" />{worker.phone}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" />{worker.city}{worker.serviceArea ? `, ${worker.serviceArea}` : ""}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Briefcase className="w-3.5 h-3.5" />{worker.experienceYears} yr{worker.experienceYears !== 1 ? "s" : ""} experience</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground"><Star className="w-3.5 h-3.5 text-yellow-400" />{worker.averageRating.toFixed(1)} ({worker.reviewCount} reviews)</div>
            </div>
          </div>
        </div>

        {worker.bio && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Bio</div>
            <p className="text-sm text-foreground">{worker.bio}</p>
          </div>
        )}

        {worker.skills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-medium text-muted-foreground mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map(s => (
                <span key={s} className="px-2 py-0.5 bg-secondary text-xs text-foreground rounded-md border border-border">{s}</span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          {worker.expectedMonthlySalary && (
            <div>
              <div className="text-xs text-muted-foreground">Monthly Rate</div>
              <div className="text-sm font-medium text-foreground mt-0.5">PKR {worker.expectedMonthlySalary.toLocaleString()}</div>
            </div>
          )}
          {worker.hourlyRate && (
            <div>
              <div className="text-xs text-muted-foreground">Hourly Rate</div>
              <div className="text-sm font-medium text-foreground mt-0.5">PKR {worker.hourlyRate.toLocaleString()}/hr</div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">CNIC Verification</h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">CNIC Number</div>
            <div className="font-mono text-sm text-foreground bg-secondary px-3 py-2 rounded-lg border border-border">{worker.cnicNumber}</div>
          </div>
          {worker.cnicImageUrl ? (
            <div>
              <div className="text-xs text-muted-foreground mb-2">CNIC Document</div>
              <div className="rounded-xl overflow-hidden border border-border bg-secondary">
                <img src={worker.cnicImageUrl} alt="CNIC" className="w-full max-h-64 object-contain" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-2.5 rounded-lg border border-border">
              <FileText className="w-3.5 h-3.5" />
              No CNIC image uploaded
            </div>
          )}
          {worker.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <div className="text-xs font-medium text-red-400 mb-0.5">Rejection Reason</div>
              <div className="text-xs text-red-300">{worker.rejectionReason}</div>
            </div>
          )}
        </div>
      </div>

      {worker.verificationStatus === "pending" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Make a Decision</h2>
          {!showRejectForm ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleVerify("approved")}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve Worker
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/30 hover:bg-destructive/20 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rejection Reason <span className="text-destructive">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Explain why the CNIC verification is being rejected..."
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify("rejected")}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 py-2.5 px-4 bg-destructive text-white rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                  className="px-4 py-2.5 bg-secondary text-foreground rounded-lg text-sm border border-border hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {worker.verificationStatus !== "pending" && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Change Decision</h2>
          <div className="flex gap-3">
            {worker.verificationStatus !== "approved" && (
              <button
                onClick={() => handleVerify("approved")}
                disabled={actionLoading}
                className="flex items-center gap-2 py-2.5 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            )}
            {worker.verificationStatus !== "rejected" && (
              <button
                onClick={() => setShowRejectForm(v => !v)}
                disabled={actionLoading}
                className="flex items-center gap-2 py-2.5 px-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium border border-destructive/30 hover:bg-destructive/20 transition-colors"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            )}
          </div>
          {showRejectForm && (
            <div className="mt-3 space-y-3">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Rejection reason..."
                rows={3}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                onClick={() => handleVerify("rejected")}
                disabled={actionLoading || !rejectReason.trim()}
                className="py-2 px-4 bg-destructive text-white rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Saving..." : "Confirm"}
              </button>
            </div>
          )}
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Reviews ({reviews.length})</h2>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="p-3 bg-secondary rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-border"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">{format(new Date(r.createdAt), "MMM d, yyyy")}</div>
                </div>
                {r.comment && <p className="text-xs text-foreground">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        Registered: {format(new Date(worker.createdAt), "MMMM d, yyyy 'at' HH:mm")} · Last updated: {format(new Date(worker.updatedAt), "MMMM d, yyyy 'at' HH:mm")}
      </div>
    </div>
  );
}
