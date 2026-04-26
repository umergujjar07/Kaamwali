import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetTask, getGetTaskQueryKey,
  useAcceptTask, 
  useUpdateTaskStatus,
  useCreateReview,
  useListReviews,
  getListTasksQueryKey,
  getListWorkerReviewsQueryKey,
  getListReviewsQueryKey
} from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Star, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function TaskDetail() {
  const params = useParams<{ id: string }>();
  const taskId = parseInt(params.id || "0", 10);
  const { role, actorId } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: task, isLoading, error } = useGetTask(taskId, {
    query: { enabled: !!taskId, queryKey: getGetTaskQueryKey(taskId) },
  });

  // Filter reviews client-side by taskId since API filters by workerId/customerId only
  const { data: taskReviews } = useListReviews(
    task?.acceptedByWorkerId ? { workerId: task.acceptedByWorkerId } : undefined,
    {
      query: {
        enabled: !!task && task.status === "completed" && !!task.acceptedByWorkerId,
        queryKey: getListReviewsQueryKey(
          task?.acceptedByWorkerId ? { workerId: task.acceptedByWorkerId } : undefined,
        ),
      },
    },
  );
  const hasReview = taskReviews?.some((r) => r.taskId === taskId);

  const acceptTask = useAcceptTask();
  const updateStatus = useUpdateTaskStatus();
  const createReview = useCreateReview();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleAccept = () => {
    if (!actorId) return;
    acceptTask.mutate({ id: taskId, data: { workerId: actorId } }, {
      onSuccess: () => {
        toast.success("Task accepted!");
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      }
    });
  };

  const handleUpdateStatus = (newStatus: "in_progress" | "completed") => {
    updateStatus.mutate({ id: taskId, data: { status: newStatus } }, {
      onSuccess: () => {
        toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
        queryClient.invalidateQueries({ queryKey: getGetTaskQueryKey(taskId) });
      }
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !task.acceptedByWorkerId || !actorId) return;

    createReview.mutate({
      data: {
        workerId: task.acceptedByWorkerId,
        customerId: actorId,
        taskId: task.id,
        rating,
        comment: comment || null
      }
    }, {
      onSuccess: () => {
        toast.success("Review submitted!");
        setReviewOpen(false);
        queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListWorkerReviewsQueryKey(task.acceptedByWorkerId!) });
      }
    });
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-[500px] w-full rounded-2xl" /></div>;
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Task not found</h2>
        <Button onClick={() => navigate("/tasks")}>Back to Tasks</Button>
      </div>
    );
  }

  const statusColors = {
    open: "bg-primary/10 text-primary border-primary/20",
    accepted: "bg-warning/10 text-warning border-warning/20",
    in_progress: "bg-primary/20 text-primary border-primary/30",
    completed: "bg-success/10 text-success border-success/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20"
  };

  const steps = ["open", "accepted", "in_progress", "completed"];
  const currentStepIndex = steps.indexOf(task.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div className="bg-card border rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="outline" className={`${statusColors[task.status]} px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="secondary" className="capitalize px-3 py-1 rounded-full">{task.category}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{task.title}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground text-sm font-medium">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {task.location}, {task.city}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {task.durationHours} hrs est.</span>
              {task.scheduledFor && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(task.scheduledFor), "MMM d, h:mm a")}</span>}
            </div>
          </div>
          <div className="bg-muted/30 p-6 rounded-2xl md:min-w-[200px] text-center border">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Budget</p>
            <p className="text-3xl font-bold text-warning">Rs. {task.budget.toLocaleString()}</p>
          </div>
        </div>

        {/* Stepper */}
        {task.status !== "cancelled" && (
          <div className="py-6 border-y">
            <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: `${(Math.max(0, currentStepIndex) / 3) * 100}%` }} />
              
              {["Posted", "Accepted", "Working", "Done"].map((label, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={label} className="relative z-10 flex flex-col items-center gap-2 bg-card px-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                    } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-50" />}
                    </div>
                    <span className={`text-xs font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Description</h3>
          <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{task.description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-muted/20 p-5 rounded-2xl border">
            <h4 className="text-xs uppercase font-bold text-muted-foreground mb-3">Posted By</h4>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border bg-background">
                {task.customer?.photoUrl ? <AvatarImage src={task.customer.photoUrl} /> : null}
                <AvatarFallback>{task.customer?.fullName?.charAt(0) || "C"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">{task.customer?.fullName || "Customer"}</p>
                <p className="text-xs text-muted-foreground">Joined recently</p>
              </div>
            </div>
          </div>

          {task.worker && (
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
              <h4 className="text-xs uppercase font-bold text-primary/70 mb-3">Assigned Worker</h4>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border bg-background">
                  {task.worker?.photoUrl ? <AvatarImage src={task.worker.photoUrl} /> : null}
                  <AvatarFallback>{task.worker?.fullName?.charAt(0) || "W"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{task.worker.fullName}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 text-warning fill-warning" /> {task.worker.averageRating.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Block */}
        <div className="bg-muted/20 p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {task.status === "open" && role === "worker" ? "You are eligible to accept this task." : 
             task.status === "open" && role === "customer" ? "Waiting for a worker to accept." :
             `Status: ${task.status.replace('_', ' ')}`}
          </p>

          {role === "worker" && actorId && task.status === "open" && (
            <Button onClick={handleAccept} disabled={acceptTask.isPending} className="rounded-xl px-8 w-full sm:w-auto shadow-md">
              {acceptTask.isPending ? "Accepting..." : "Accept Task"}
            </Button>
          )}

          {role === "worker" && actorId === task.acceptedByWorkerId && task.status === "accepted" && (
            <Button onClick={() => handleUpdateStatus("in_progress")} disabled={updateStatus.isPending} className="rounded-xl px-8 w-full sm:w-auto bg-primary text-primary-foreground shadow-md">
              Start Work
            </Button>
          )}

          {role === "worker" && actorId === task.acceptedByWorkerId && task.status === "in_progress" && (
            <Button onClick={() => handleUpdateStatus("completed")} disabled={updateStatus.isPending} className="rounded-xl px-8 w-full sm:w-auto bg-success hover:bg-success/90 text-success-foreground shadow-md">
              Mark Complete
            </Button>
          )}

          {role === "customer" && actorId === task.customerId && task.status === "completed" && !hasReview && (
            <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl px-8 w-full sm:w-auto bg-warning hover:bg-warning/90 text-warning-foreground shadow-md gap-2">
                  <Star className="w-4 h-4 fill-current" /> Leave a Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rate the work</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitReview} className="space-y-6 pt-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                        <Star className={`w-10 h-10 ${rating >= star ? "text-warning fill-warning" : "text-muted fill-muted"}`} />
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Comment (Optional)</Label>
                    <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="How was your experience?" />
                  </div>
                  <Button type="submit" className="w-full" disabled={createReview.isPending}>Submit Review</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {role === "customer" && task.status === "completed" && hasReview && (
            <Badge variant="outline" className="text-success border-success bg-success/10 px-4 py-2">Review Submitted</Badge>
          )}
        </div>
        
      </div>
    </div>
  );
}
