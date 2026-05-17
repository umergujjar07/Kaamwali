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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Star, MapPin, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

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
  const [monthlySalary, setMonthlySalary] = useState<string>("");
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
        notes
      }
    }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        toast.success("Booking created successfully!");
        setBookingOpen(false);
        navigate(`/bookings/${data.id}`);
      },
      onError: () => {
        toast.error("Failed to create booking.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Worker not found</h2>
        <p className="text-muted-foreground mt-2">The worker profile you're looking for doesn't exist or was removed.</p>
        <Button className="mt-6" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
              {worker.photoUrl ? <AvatarImage src={worker.photoUrl} className="object-cover" /> : null}
              <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                {worker.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-foreground">{worker.fullName}</h1>
                {worker.verificationStatus === "approved" ? (
                  <Badge className="bg-success text-success-foreground px-3 py-1 text-sm gap-1 w-fit">
                    <ShieldCheck className="w-4 h-4" /> Verified by KaamWali.com
                  </Badge>
                ) : worker.verificationStatus === "pending" ? (
                  <Badge variant="outline" className="text-warning border-warning/50 bg-warning/10 px-3 py-1 text-sm gap-1 w-fit">
                    Pending Verification
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground px-3 py-1 text-sm w-fit">
                    Unverified
                  </Badge>
                )}
              </div>
              <p className="text-lg text-primary capitalize font-medium">{worker.category}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {worker.city} {worker.serviceArea && `(${worker.serviceArea})`}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {worker.experienceYears} Years Exp.</span>
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-warning fill-warning" /> {worker.averageRating.toFixed(1)} ({worker.reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">About</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{worker.bio || "No bio provided."}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 rounded-full font-medium">
                  {skill}
                </Badge>
              ))}
              {worker.skills.length === 0 && <span className="text-muted-foreground text-sm">No specific skills listed.</span>}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Reviews</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{review.customer?.fullName || "Customer"}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-warning fill-warning" : "text-muted fill-muted"}`} />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-foreground/80">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm italic">No reviews yet.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 pb-4">
              <h3 className="font-semibold text-lg text-center">Pricing</h3>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Monthly Salary</p>
                <p className="text-3xl font-bold text-primary">
                  {worker.expectedMonthlySalary ? `Rs. ${worker.expectedMonthlySalary.toLocaleString()}` : 'Negotiable'}
                </p>
              </div>
              {worker.hourlyRate && (
                <div className="space-y-1 text-center border-t pt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hourly Rate</p>
                  <p className="text-lg font-medium text-foreground">Rs. {worker.hourlyRate.toLocaleString()} / hr</p>
                </div>
              )}
              
              <div className="space-y-3 pt-4 border-t">
                {role === "customer" && !actorId ? (
                  <div className="p-3 bg-warning/10 text-warning text-sm rounded-xl text-center">
                    Select a customer profile to hire this worker.
                  </div>
                ) : (
                  <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full rounded-xl h-12 text-base font-semibold shadow-md bg-primary hover:bg-primary/90" size="lg">
                        Hire Monthly
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
                      {/* Dialog Header — colored band */}
                      <div className="bg-gradient-to-r from-primary to-blue-500 px-6 pt-6 pb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 bg-white/20 flex-shrink-0">
                            {worker.photoUrl
                              ? <img src={worker.photoUrl} alt={worker.fullName} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">{worker.fullName.charAt(0)}</div>
                            }
                          </div>
                          <div>
                            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Monthly Hire Contract</p>
                            <h2 className="text-xl font-bold text-white">{worker.fullName}</h2>
                            <p className="text-white/80 text-sm capitalize">{worker.category} · {worker.city}</p>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleBooking} className="px-6 py-5 space-y-5">
                        {/* Start Date */}
                        <div className="space-y-1.5">
                          <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            required
                            className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-slate-50 text-gray-800 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-colors"
                          />
                        </div>

                        {/* Monthly Salary */}
                        <div className="space-y-1.5">
                          <label htmlFor="monthlySalary" className="block text-sm font-semibold text-gray-700">
                            Agreed Monthly Salary <span className="text-red-500">*</span>
                          </label>
                          {worker.expectedMonthlySalary && (
                            <p className="text-xs text-gray-500">Worker expects <span className="font-semibold text-primary">PKR {worker.expectedMonthlySalary.toLocaleString()}/month</span></p>
                          )}
                          <div className="flex h-11 rounded-xl border-2 border-gray-200 bg-slate-50 overflow-hidden focus-within:border-primary focus-within:bg-white transition-colors">
                            <div className="flex items-center px-3 border-r border-gray-200 bg-blue-50">
                              <span className="text-sm font-bold text-primary whitespace-nowrap">PKR</span>
                            </div>
                            <input
                              id="monthlySalary"
                              type="number"
                              min="1000"
                              placeholder={worker.expectedMonthlySalary?.toString() || "25000"}
                              value={monthlySalary}
                              onChange={e => setMonthlySalary(e.target.value)}
                              required
                              className="flex-1 px-3 bg-transparent text-gray-800 text-sm font-medium focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1.5">
                          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">
                            Special Instructions <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <textarea
                            id="notes"
                            rows={3}
                            placeholder="Working hours, specific duties, accommodation, meals, etc."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-slate-50 text-gray-800 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
                          />
                        </div>

                        {/* Summary Box */}
                        {monthlySalary && (
                          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3.5">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Contract Summary</p>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Monthly salary</span>
                              <span className="font-bold text-gray-800">PKR {parseInt(monthlySalary || "0").toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-600">Starting from</span>
                              <span className="font-semibold text-gray-800">{startDate ? new Date(startDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) : "—"}</span>
                            </div>
                          </div>
                        )}

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={createBooking.isPending || !monthlySalary}
                          className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
                        >
                          {createBooking.isPending ? "Creating contract..." : "Confirm Monthly Hire"}
                        </button>

                        <p className="text-center text-xs text-gray-400">
                          By confirming, you agree to pay the agreed salary monthly. You can end the contract at any time.
                        </p>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
                
                <Button variant="outline" className="w-full rounded-xl h-12" onClick={() => navigate("/tasks/new")}>
                  Post a task for this category
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
