import { useState } from "react";
import { useLocation } from "wouter";
import { useListTasks, useAcceptTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Search, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];
const CATEGORIES = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

export default function Tasks() {
  const { role, actorId } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<string>("all");
  const [city, setCity] = useState<string>("all");

  const queryParams: any = { status: "open" };
  if (category !== "all") queryParams.category = category;
  if (city !== "all") queryParams.city = city;

  const { data: tasks, isLoading } = useListTasks(queryParams);
  const acceptTask = useAcceptTask();

  const handleAccept = (taskId: number) => {
    if (!actorId || role !== "worker") return;
    
    acceptTask.mutate({
      id: taskId,
      data: { workerId: actorId }
    }, {
      onSuccess: () => {
        toast.success("Task accepted!");
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        navigate(`/tasks/${taskId}`);
      },
      onError: () => {
        toast.error("Failed to accept task.");
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="page-panel p-6 mb-6 -mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Open Tasks</h1>
          <p className="text-muted-foreground mt-1">Find short-term jobs and gigs in your area.</p>
        </div>
        
        {role === "customer" && (
          <Button onClick={() => navigate("/tasks/new")} className="rounded-full shadow-sm">
            Post a Task
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-2xl p-4 shadow-sm mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : tasks && tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow border-border/60">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1 cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`)}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{task.title}</h3>
                      <Badge variant="outline" className="capitalize shrink-0 ml-2">{task.category}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {task.city} ({task.location})</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {task.durationHours} hours</span>
                      <span className="flex items-center gap-1 text-xs">Posted {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-6 md:w-64 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-border/50 gap-4">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Budget</p>
                      <p className="text-xl font-bold text-warning">Rs. {task.budget.toLocaleString()}</p>
                    </div>
                    
                    {role === "worker" && actorId && (
                      <Button 
                        onClick={(e) => { e.stopPropagation(); handleAccept(task.id); }} 
                        disabled={acceptTask.isPending}
                        className="rounded-xl w-full md:w-auto px-8 shrink-0 shadow-sm bg-primary hover:bg-primary/90"
                      >
                        {acceptTask.isPending ? "Accepting..." : "Accept Task"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-muted/20">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No open tasks right now</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Check back soon for new opportunities or adjust your filters.
          </p>
          {(category !== "all" || city !== "all") && (
            <Button variant="outline" className="mt-6 rounded-xl" onClick={() => { setCategory("all"); setCity("all"); }}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
