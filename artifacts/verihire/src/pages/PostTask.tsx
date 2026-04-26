import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];
const CATEGORIES = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

export default function PostTask() {
  const { role, actorId, setRole } = useRole();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createTask = useCreateTask();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    durationHours: "1",
    location: "",
    city: "",
    budget: "",
    scheduledFor: ""
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actorId || role !== "customer") return;

    createTask.mutate({
      data: {
        customerId: actorId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        durationHours: parseInt(formData.durationHours, 10) || 1,
        location: formData.location,
        city: formData.city,
        budget: parseInt(formData.budget, 10),
        scheduledFor: formData.scheduledFor ? new Date(formData.scheduledFor).toISOString() : null,
      }
    }, {
      onSuccess: (data) => {
        toast.success("Task posted successfully!");
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        navigate(`/tasks/${data.id}`);
      },
      onError: () => {
        toast.error("Failed to post task");
      }
    });
  };

  if (role !== "customer" || !actorId) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md">
        <Card className="border-border text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Customer Account Required</CardTitle>
            <CardDescription>You need to be logged in as a customer to post tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setRole("customer")} className="w-full rounded-xl">Switch to Customer Role</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          Post a New Task
        </h1>
        <p className="text-muted-foreground">Describe what you need done, and verified workers in your city will be able to accept it.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">Task Title <span className="text-destructive">*</span></Label>
              <Input id="title" value={formData.title} onChange={e => updateForm("title", e.target.value)} required placeholder="e.g. Deep clean 3-bedroom apartment" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                <Select value={formData.category} onValueChange={v => updateForm("category", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select service" className="capitalize" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (PKR) <span className="text-destructive">*</span></Label>
                <Input id="budget" type="number" min="0" value={formData.budget} onChange={e => updateForm("budget", e.target.value)} required placeholder="e.g. 5000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description <span className="text-destructive">*</span></Label>
              <Textarea id="description" value={formData.description} onChange={e => updateForm("description", e.target.value)} required placeholder="What exactly needs to be done? Provide tools? Any specific requirements?" className="h-32" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                <Select value={formData.city} onValueChange={v => updateForm("city", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent>
                    {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Area <span className="text-destructive">*</span></Label>
                <Input id="location" value={formData.location} onChange={e => updateForm("location", e.target.value)} required placeholder="e.g. DHA Phase 6" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="durationHours">Estimated Duration (Hours) <span className="text-destructive">*</span></Label>
                <Input id="durationHours" type="number" min="1" value={formData.durationHours} onChange={e => updateForm("durationHours", e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledFor">Scheduled Date & Time (Optional)</Label>
                <Input id="scheduledFor" type="datetime-local" value={formData.scheduledFor} onChange={e => updateForm("scheduledFor", e.target.value)} />
              </div>
            </div>

            <Button type="submit" disabled={createTask.isPending} className="w-full rounded-xl h-12 text-lg shadow-md mt-4">
              {createTask.isPending ? "Posting..." : "Post Task"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
