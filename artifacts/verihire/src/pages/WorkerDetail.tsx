import { useState } from "react";
import { useLocation, useParams } from "wouter";
import {
  useGetWorker,
  useListWorkerReviews,
  useCreateBooking,
  getListBookingsQueryKey,
  getGetWorkerQueryKey,
  getListWorkerReviewsQueryKey,
} from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldCheck, Star, MapPin, Clock, Briefcase, CheckCircle2,
  AlertCircle, Calendar, Loader2, Eye, Phone, Award,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

const GLASS_CARD = {
  background: "rgba(255,255,255,0.60)",
  backdropFilter: "blur(20px) saturate(160%)",
  WebkitBackdropFilter: "blur(20px) saturate(160%)",
  border: "1px solid rgba(255,255,255,0.70)",
  boxShadow: "0 4px 24px rgba(30,144,255,0.07), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)",
} as React.CSSProperties;

const GLASS_MUTED = {
  background: "rgba(248,252,255,0.70)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(200,220,255,0.45)",
  boxShadow: "0 2px 8px rgba(30,144,255,0.05)",
} as React.CSSProperties;

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
    </div>
  );
}

export default function WorkerDetail() {
  const params = useParams<{ id: string }>();
  const workerId = parseInt(params.id || "0", 10);
  const { role, actorId } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: worker, isLoading, error } = useGetWorker(workerId, {
    query: { enabled: !!workerId, queryKey: getGetWorkerQueryKey(workerId) },
  });
  const { data: reviews } = useListWorkerReviews(workerId, {
    query: { enabled: !!workerId, queryKey: getListWorkerReviewsQueryKey(workerId) },
  });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [monthlySalary, setMonthlySalary] = useState("");
  const [notes, setNotes] = useState("");
  const createBooking = useCreateBooking();

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actorId || role !== "customer") {
      toast.error("You must be logged in as a customer to hire.");
      return;
    }
    createBooking.mutate({
      data: {
        workerId,
        customerId: actorId,
        startDate: new Date(startDate).toISOString(),
        monthlySalary: parseInt(monthlySalary || worker?.expectedMonthlySalary?.toString() || "0", 10),
        notes,
      },
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        toast.success("Booking created successfully!");
        setBookingOpen(false);
        navigate(`/bookings/${data.id}`);
      },
      onError: () => toast.error("Failed to create booking."),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-5">
        <Skeleton className="h-56 w-full rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Worker not found</h2>
        <p className="text-muted-foreground mt-2">This profile doesn't exist or was removed.</p>
        <Button className="mt-6 rounded-xl" onClick={() => navigate("/")}>Browse Workers</Button>
      </div>
    );
  }

  const isVerified = worker.verificationStatus === "approved";
  const ratingNum = parseFloat(worker.averageRating as unknown as string) || 0;

  const stats = [
    { icon: <Clock className="w-4 h-4" />, label: "Experience", value: `${worker.experienceYears} yrs` },
    { icon: <Briefcase className="w-4 h-4" />, label: "Jobs Done", value: worker.completedJobs.toString() },
    { icon: <Star className="w-4 h-4 text-amber-500" />, label: "Rating", value: ratingNum.toFixed(1) },
    { icon: <Eye className="w-4 h-4" />, label: "Reviews", value: worker.reviewCount.toString() },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">

      {/* ── HERO BANNER ── */}
      <div
        className="relative rounded-3xl overflow-hidden mb-6"
        style={{
          background: "linear-gradient(135deg, #0b1535 0%, #1E90FF 55%, #0060cc 100%)",
          boxShadow: "0 8px 32px rgba(30,144,255,0.30)",
        }}
      >
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, white 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />

        <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 px-8 py-8">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="w-28 h-28 border-4 shadow-2xl" style={{ borderColor: "rgba(255,255,255,0.35)" }}>
                {worker.photoUrl && <AvatarImage src={worker.photoUrl} className="object-cover" />}
                <AvatarFallback className="text-4xl font-bold text-white" style={{ background: "rgba(255,255,255,0.2)" }}>
                  {worker.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "#22c55e", border: "2px solid white" }}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-3xl font-bold text-white">{worker.fullName}</h1>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.45)", color: "#86efac" }}>
                  <ShieldCheck className="w-3.5 h-3.5" /> KaamWali Verified
                </span>
              ) : worker.verificationStatus === "pending" ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.35)", color: "#fde047" }}>
                  Pending Review
                </span>
              ) : null}
            </div>

            <p className="text-blue-200 font-semibold text-lg capitalize mb-3">{worker.category}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-300" />
                {worker.city}{worker.serviceArea && ` · ${worker.serviceArea}`}
              </span>
              <span className="flex items-center gap-1.5">
                <StarRow rating={ratingNum} />
                <span className="text-white font-semibold">{ratingNum.toFixed(1)}</span>
                <span className="text-white/50">({worker.reviewCount})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-300" />
                Available for hire
              </span>
            </div>
          </div>

          {/* Quick price */}
          <div className="flex-shrink-0 text-center md:text-right">
            <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">Monthly Salary</div>
            <div className="text-3xl font-bold text-white">
              {worker.expectedMonthlySalary ? `Rs. ${worker.expectedMonthlySalary.toLocaleString()}` : "Negotiable"}
            </div>
            {worker.hourlyRate && (
              <div className="text-white/60 text-sm mt-1">Rs. {worker.hourlyRate.toLocaleString()} / hr</div>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-4 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          {stats.map((s, i) => (
            <div key={i} className={`flex flex-col items-center py-4 gap-1 text-center ${i < 3 ? "border-r" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="text-white/50 flex items-center gap-1 text-xs">{s.icon} {s.label}</div>
              <div className="text-white font-bold text-lg">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: bio, skills, reviews */}
        <div className="lg:col-span-2 space-y-5">

          {/* About */}
          <div className="rounded-2xl p-6" style={GLASS_CARD}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 rounded-full bg-primary" />
              <h2 className="text-lg font-bold text-foreground">About</h2>
            </div>
            <p className="text-foreground/70 leading-relaxed whitespace-pre-wrap text-sm">
              {worker.bio || "This worker hasn't added a bio yet."}
            </p>
          </div>

          {/* Skills */}
          {worker.skills.length > 0 && (
            <div className="rounded-2xl p-6" style={GLASS_CARD}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-foreground">Skills & Expertise</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-primary"
                    style={{ background: "rgba(30,144,255,0.10)", border: "1px solid rgba(30,144,255,0.25)" }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Work info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: <Clock className="w-5 h-5 text-primary" />, label: "Experience", value: `${worker.experienceYears} Years` },
              { icon: <Briefcase className="w-5 h-5 text-success" />, label: "Jobs Completed", value: worker.completedJobs },
              { icon: <Award className="w-5 h-5 text-amber-500" />, label: "Availability", value: worker.availability === "available" ? "Available Now" : "Unavailable" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl p-4 flex flex-col items-center text-center gap-2" style={GLASS_MUTED}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.7)" }}>
                  {item.icon}
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{item.label}</div>
                <div className="font-bold text-foreground text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Reviews */}
          <div className="rounded-2xl p-6" style={GLASS_CARD}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-foreground">Reviews</h2>
              </div>
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRow rating={ratingNum} />
                  <span className="font-bold text-foreground">{ratingNum.toFixed(1)}</span>
                  <span className="text-muted-foreground text-sm">({reviews.length})</span>
                </div>
              )}
            </div>

            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl p-4" style={GLASS_MUTED}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-foreground text-sm">{review.customer?.fullName || "Customer"}</div>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground/75 mt-2 leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No reviews yet — be the first to hire!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar: pricing + actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl overflow-hidden" style={{
            ...GLASS_CARD,
            boxShadow: "0 8px 32px rgba(30,144,255,0.12), 0 1px 3px rgba(0,0,0,0.06)",
          }}>
            {/* Pricing header */}
            <div className="px-6 py-5 text-center"
              style={{ background: "linear-gradient(135deg, rgba(30,144,255,0.15), rgba(0,96,204,0.1))", borderBottom: "1px solid rgba(30,144,255,0.15)" }}>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Pricing</p>
              {worker.expectedMonthlySalary ? (
                <>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Monthly Salary</p>
                  <p className="text-3xl font-extrabold text-primary">
                    Rs. {worker.expectedMonthlySalary.toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-foreground">Negotiable</p>
              )}
              {worker.hourlyRate && (
                <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(30,144,255,0.15)" }}>
                  <p className="text-xs text-muted-foreground">Hourly Rate</p>
                  <p className="text-lg font-bold text-foreground">Rs. {worker.hourlyRate.toLocaleString()} / hr</p>
                </div>
              )}
            </div>

            {/* Action area */}
            <div className="px-5 py-5 space-y-3">
              {isVerified ? (
                <div className="flex items-center justify-center gap-1.5 text-xs text-success font-semibold py-2 rounded-xl"
                  style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
                  <ShieldCheck className="w-4 h-4" /> CNIC Verified by KaamWali.com
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-600 font-semibold py-2 rounded-xl"
                  style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)" }}>
                  Pending Admin Verification
                </div>
              )}

              {!bookingOpen ? (
                <>
                  {role === "customer" && (
                    <button
                      onClick={() => setBookingOpen(true)}
                      className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2"
                      style={{
                        background: "linear-gradient(135deg, #1E90FF, #0060cc)",
                        boxShadow: "0 6px 20px rgba(30,144,255,0.40), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <Calendar className="w-4 h-4" /> Hire Monthly
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/tasks/new")}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-primary transition-all"
                    style={{ background: "rgba(30,144,255,0.08)", border: "1px solid rgba(30,144,255,0.2)" }}
                  >
                    Post a Task Instead
                  </button>
                </>
              ) : (
                /* Inline booking form */
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-foreground">Monthly Contract</p>
                    <button type="button" onClick={() => setBookingOpen(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required
                      className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      style={{ background: "rgba(248,252,255,0.9)", borderColor: "rgba(30,144,255,0.25)" }} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Monthly Salary (PKR)</label>
                    <div className="flex rounded-xl overflow-hidden border focus-within:ring-2 focus-within:ring-primary/30"
                      style={{ background: "rgba(248,252,255,0.9)", borderColor: "rgba(30,144,255,0.25)" }}>
                      <span className="px-3 py-2.5 text-xs font-bold text-primary border-r" style={{ borderColor: "rgba(30,144,255,0.2)", background: "rgba(30,144,255,0.07)" }}>PKR</span>
                      <input type="number" min="1000" placeholder={worker.expectedMonthlySalary?.toString() || "25000"}
                        value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)} required
                        className="flex-1 px-3 py-2.5 bg-transparent text-sm text-foreground focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Notes (optional)</label>
                    <textarea rows={2} placeholder="Working hours, duties…" value={notes} onChange={e => setNotes(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      style={{ background: "rgba(248,252,255,0.9)", borderColor: "rgba(30,144,255,0.25)" }} />
                  </div>

                  {monthlySalary && (
                    <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(30,144,255,0.08)", border: "1px solid rgba(30,144,255,0.2)" }}>
                      <div className="flex justify-between text-foreground/80 mb-1">
                        <span>Monthly salary</span><span className="font-bold">PKR {parseInt(monthlySalary || "0").toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-foreground/80">
                        <span>Start date</span><span className="font-semibold">{new Date(startDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={createBooking.isPending || !monthlySalary}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #1E90FF, #0060cc)", boxShadow: "0 4px 15px rgba(30,144,255,0.35)" }}>
                    {createBooking.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : "Confirm Hire"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
