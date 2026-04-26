import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetBooking, 
  useListAttendance, 
  useCreateAttendance,
  useUpdateBookingStatus,
  useCreateReview,
  useListReviews,
  getGetBookingQueryKey,
  getListAttendanceQueryKey,
  getListBookingsQueryKey,
  getListWorkerReviewsQueryKey,
  getListReviewsQueryKey
} from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, parseISO, isToday } from "date-fns";
import { Calendar as CalendarIcon, MapPin, CheckCircle2, XCircle, AlertCircle, Star, TrendingUp, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingDetail() {
  const params = useParams<{ id: string }>();
  const bookingId = parseInt(params.id || "0", 10);
  const { role, actorId } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: booking, isLoading: loadingBooking } = useGetBooking(bookingId, {
    query: { enabled: !!bookingId, queryKey: getGetBookingQueryKey(bookingId) },
  });
  const { data: attendanceList, isLoading: loadingAttendance } = useListAttendance(bookingId, {
    query: { enabled: !!bookingId, queryKey: getListAttendanceQueryKey(bookingId) },
  });

  // Filter reviews client-side by bookingId since API filters by workerId/customerId only
  const { data: reviews } = useListReviews(
    booking ? { workerId: booking.workerId } : undefined,
    {
      query: {
        enabled: !!booking && booking.status === "completed",
        queryKey: getListReviewsQueryKey(
          booking ? { workerId: booking.workerId } : undefined,
        ),
      },
    },
  );
  const hasReview = reviews?.some((r) => r.bookingId === bookingId);

  const createAttendance = useCreateAttendance();
  const updateStatus = useUpdateBookingStatus();
  const createReview = useCreateReview();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [endContractOpen, setEndContractOpen] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleMarkAttendance = (status: "present" | "absent") => {
    if (!actorId || role !== "customer") return;

    createAttendance.mutate({
      id: bookingId,
      data: { date: todayStr, status }
    }, {
      onSuccess: () => {
        toast.success(`Marked as ${status}`);
        queryClient.invalidateQueries({ queryKey: getListAttendanceQueryKey(bookingId) });
        queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(bookingId) });
      }
    });
  };

  const handleEndContract = () => {
    updateStatus.mutate({ id: bookingId, data: { status: "completed" } }, {
      onSuccess: () => {
        toast.success("Contract ended successfully");
        setEndContractOpen(false);
        queryClient.invalidateQueries({ queryKey: getGetBookingQueryKey(bookingId) });
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
      }
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !actorId) return;

    createReview.mutate({
      data: {
        workerId: booking.workerId,
        customerId: actorId,
        bookingId: booking.id,
        rating,
        comment: comment || null
      }
    }, {
      onSuccess: () => {
        toast.success("Review submitted!");
        setReviewOpen(false);
        queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWorkerReviewsQueryKey(booking.workerId) });
      }
    });
  };

  if (loadingBooking || loadingAttendance) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Booking not found</h2>
        <Button className="mt-6 rounded-xl" onClick={() => navigate("/bookings")}>Back to Bookings</Button>
      </div>
    );
  }

  const isCustomer = role === "customer";
  const canMarkAttendance = isCustomer && actorId === booking.customerId && booking.status === "active";
  
  // Calendar generation
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Find today's attendance record if it exists
  const todayRecord = attendanceList?.find(a => a.date.startsWith(todayStr));

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Header Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <div className="h-2 bg-primary w-full" />
          <CardContent className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Worker Profile</h3>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border shadow-sm bg-background">
                {booking.worker?.photoUrl ? <AvatarImage src={booking.worker.photoUrl} className="object-cover" /> : null}
                <AvatarFallback className="text-lg bg-primary/10 text-primary">{booking.worker?.fullName?.charAt(0) || "W"}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{booking.worker?.fullName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary border-none">
                    {booking.worker?.category}
                  </Badge>
                  {booking.worker?.city && <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {booking.worker.city}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm overflow-hidden bg-gradient-to-bl from-background to-muted/20">
          <div className={`h-2 w-full ${booking.status === 'active' ? 'bg-success' : booking.status === 'completed' ? 'bg-muted' : 'bg-destructive'}`} />
          <CardContent className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Contract Details</h3>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">Status</p>
                <Badge className={`uppercase tracking-wider text-xs font-bold px-3 py-1 ${
                  booking.status === 'active' ? 'bg-success/20 text-success hover:bg-success/30' :
                  booking.status === 'completed' ? 'bg-muted text-muted-foreground hover:bg-muted' :
                  'bg-destructive/20 text-destructive hover:bg-destructive/30'
                }`}>
                  {booking.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-medium mb-1">Monthly Salary</p>
                <p className="text-2xl font-bold text-foreground">Rs. {booking.monthlySalary.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2 border-t border-border/50">
              <CalendarIcon className="w-4 h-4" /> Started {format(new Date(booking.startDate), "MMM d, yyyy")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Grid */}
      <Card className="border-border shadow-md overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 sm:p-8 bg-card border-b flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-primary" /> 
                {format(today, "MMMM yyyy")} Attendance
              </h2>
              <p className="text-muted-foreground mt-1">Track daily presence to ensure accurate payments.</p>
            </div>

            {/* Action Buttons for Today */}
            {canMarkAttendance && (
              <div className="flex items-center gap-3 w-full md:w-auto bg-muted/30 p-3 rounded-2xl border">
                <span className="text-sm font-semibold mr-2 shrink-0">Today:</span>
                <Button 
                  onClick={() => handleMarkAttendance("present")} 
                  disabled={createAttendance.isPending || todayRecord?.status === "present"}
                  variant={todayRecord?.status === "present" ? "default" : "outline"}
                  className={`rounded-xl flex-1 md:flex-none gap-2 font-semibold shadow-sm transition-all ${
                    todayRecord?.status === "present" ? "bg-success text-success-foreground border-success hover:bg-success/90" : "hover:bg-success/10 hover:text-success hover:border-success/50"
                  }`}
                >
                  <UserCheck className="w-4 h-4" /> {todayRecord?.status === "present" ? "Marked Present" : "Present"}
                </Button>
                <Button 
                  onClick={() => handleMarkAttendance("absent")} 
                  disabled={createAttendance.isPending || todayRecord?.status === "absent"}
                  variant={todayRecord?.status === "absent" ? "destructive" : "outline"}
                  className={`rounded-xl flex-1 md:flex-none gap-2 font-semibold shadow-sm transition-all ${
                    todayRecord?.status === "absent" ? "bg-destructive text-destructive-foreground" : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                  }`}
                >
                  <UserX className="w-4 h-4" /> {todayRecord?.status === "absent" ? "Marked Absent" : "Absent"}
                </Button>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 bg-background/50">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {/* Pad start of month */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square rounded-xl bg-transparent" />
              ))}
              
              {daysInMonth.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const record = attendanceList?.find(a => a.date.startsWith(dateStr));
                const isCurrentDay = isToday(day);
                const isFuture = day > today;
                
                let cellClass = "bg-muted/20 border-border text-muted-foreground";
                let Icon = null;
                
                if (record?.status === "present") {
                  cellClass = "bg-success/15 border-success/40 text-success-foreground font-bold shadow-sm";
                  Icon = CheckCircle2;
                } else if (record?.status === "absent") {
                  cellClass = "bg-destructive/15 border-destructive/40 text-destructive-foreground font-bold shadow-sm";
                  Icon = XCircle;
                } else if (isCurrentDay) {
                  cellClass = "bg-primary/5 border-primary/40 text-foreground ring-2 ring-primary/20 shadow-md font-bold";
                } else if (!isFuture && !record) {
                  cellClass = "bg-card border-border hover:bg-muted/50 text-foreground";
                } else if (isFuture) {
                  cellClass = "bg-transparent border-transparent text-muted-foreground/30";
                }

                return (
                  <AnimatePresence mode="popLayout" key={dateStr}>
                    <motion.div 
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border transition-all duration-300 ${cellClass}`}
                    >
                      <span className="text-sm sm:text-xl relative z-10">{format(day, "d")}</span>
                      {Icon && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 sm:top-1 sm:right-1 bg-background rounded-full shadow-sm"
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${record?.status === "present" ? "text-success" : "text-destructive"}`} />
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-success/20 border border-success/40 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-success" /></div>
                <span className="text-sm font-medium text-muted-foreground">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-destructive/20 border border-destructive/40 flex items-center justify-center"><XCircle className="w-3 h-3 text-destructive" /></div>
                <span className="text-sm font-medium text-muted-foreground">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md bg-primary/5 border border-primary/40 ring-1 ring-primary/20" />
                <span className="text-sm font-medium text-muted-foreground">Today</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      {booking.attendanceSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-success/20 bg-success/5 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <UserCheck className="w-8 h-8 text-success mb-2" />
              <p className="text-3xl font-bold text-success">{booking.attendanceSummary.presentDays}</p>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1">Days Present</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <UserX className="w-8 h-8 text-destructive mb-2" />
              <p className="text-3xl font-bold text-destructive">{booking.attendanceSummary.absentDays}</p>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1">Days Absent</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <p className="text-3xl font-bold text-primary">{booking.attendanceSummary.currentStreak}</p>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1">Current Streak</p>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <CalendarIcon className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-3xl font-bold text-foreground">
                {booking.attendanceSummary.presentDays + booking.attendanceSummary.absentDays > 0 
                  ? Math.round((booking.attendanceSummary.presentDays / (booking.attendanceSummary.presentDays + booking.attendanceSummary.absentDays)) * 100) 
                  : 0}%
              </p>
              <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground mt-1">Attendance Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contract Actions */}
      {booking.status === "active" && role === "customer" && (
        <div className="flex justify-end pt-4">
          <Dialog open={endContractOpen} onOpenChange={setEndContractOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="rounded-xl px-8 shadow-md">End Contract</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> End Contract Confirmation
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-foreground mb-2">Are you sure you want to end this contract with <strong>{booking.worker?.fullName}</strong>?</p>
                <p className="text-sm text-muted-foreground">This action will change the status to Completed. You will be prompted to leave a review.</p>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-xl">Cancel</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleEndContract} disabled={updateStatus.isPending} className="rounded-xl">
                  {updateStatus.isPending ? "Ending..." : "Yes, End Contract"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Review Action */}
      {booking.status === "completed" && role === "customer" && !hasReview && (
        <Card className="border-warning/30 bg-warning/5 shadow-md overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Star className="w-6 h-6 text-warning fill-warning" /> Rate your experience
              </h3>
              <p className="text-muted-foreground max-w-md">Your feedback helps maintain trust in the VeriHire community and rewards good workers.</p>
            </div>
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-warning hover:bg-warning/90 text-warning-foreground rounded-xl h-12 px-8 shadow-md text-base">
                  Leave a Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Review {booking.worker?.fullName}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-6 pt-4">
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                        <Star className={`w-12 h-12 ${rating >= star ? "text-warning fill-warning" : "text-muted fill-muted"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Comment (Optional)</Label>
                    <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="How was their work ethics, punctuality, and behavior?" className="h-32" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl h-12 text-lg" disabled={createReview.isPending}>
                    {createReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {booking.status === "completed" && role === "customer" && hasReview && (
        <div className="flex justify-center p-6 border rounded-2xl bg-success/5 border-success/20">
          <p className="text-success font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> You have reviewed this completed contract.
          </p>
        </div>
      )}
    </div>
  );
}
