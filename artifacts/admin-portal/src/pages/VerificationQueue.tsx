import { useListWorkers } from "@workspace/api-client-react";
import { CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const CATEGORY_LABELS: Record<string, string> = {
  maid: "Maid", driver: "Driver", guard: "Guard",
  cook: "Cook", nanny: "Nanny", gardener: "Gardener", other: "Other",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/15 text-green-400 border border-green-500/20"><CheckCircle className="w-3 h-3" />Approved</span>;
  if (status === "rejected") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" />Rejected</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" />Pending</span>;
}

export default function VerificationQueue() {
  const { data: pending, isLoading: loadingPending } = useListWorkers({ verificationStatus: "pending" });
  const { data: approved, isLoading: loadingApproved } = useListWorkers({ verificationStatus: "approved" });
  const { data: rejected, isLoading: loadingRejected } = useListWorkers({ verificationStatus: "rejected" });

  const isLoading = loadingPending || loadingApproved || loadingRejected;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Verification Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Review worker CNIC documents and approve or reject registrations</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", count: pending?.length ?? 0, color: "text-amber-400 bg-amber-500/15 border-amber-500/20" },
          { label: "Approved", count: approved?.length ?? 0, color: "text-green-400 bg-green-500/15 border-green-500/20" },
          { label: "Rejected", count: rejected?.length ?? 0, color: "text-red-400 bg-red-500/15 border-red-500/20" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{count}</div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>{label}</span>
          </div>
        ))}
      </div>

      {(pending?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Awaiting Review ({pending!.length})
          </h2>
          <div className="space-y-2">
            {pending!.map(w => (
              <Link key={w.id} href={`/verify/${w.id}`}>
                <div className="bg-card border border-amber-500/20 rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                    {w.photoUrl
                      ? <img src={w.photoUrl} alt={w.fullName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">{w.fullName.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{w.fullName}</div>
                    <div className="text-xs text-muted-foreground">{CATEGORY_LABELS[w.category] ?? w.category} · {w.city}</div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">CNIC: {w.cnicNumber} · Registered {format(new Date(w.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={w.verificationStatus} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(pending?.length === 0) && !isLoading && (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-3" />
          <div className="text-sm font-medium text-foreground">No pending reviews</div>
          <div className="text-xs text-muted-foreground mt-1">All worker submissions have been reviewed.</div>
        </div>
      )}

      {(rejected?.length ?? 0) > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Recently Rejected ({rejected!.length})
          </h2>
          <div className="space-y-2">
            {rejected!.slice(0, 5).map(w => (
              <Link key={w.id} href={`/verify/${w.id}`}>
                <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors cursor-pointer flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex-shrink-0">
                    {w.photoUrl
                      ? <img src={w.photoUrl} alt={w.fullName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm font-bold text-muted-foreground">{w.fullName.charAt(0)}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">{w.fullName}</div>
                    <div className="text-xs text-muted-foreground">{CATEGORY_LABELS[w.category] ?? w.category} · {w.city}</div>
                    {w.rejectionReason && <div className="text-xs text-red-400/80 mt-0.5 truncate">Reason: {w.rejectionReason}</div>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={w.verificationStatus} />
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
