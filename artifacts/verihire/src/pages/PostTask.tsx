import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateTask, getListTasksQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, DollarSign, Tag, FileText, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];
const CATEGORIES = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function FieldIcon({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <div className="flex rounded-xl border-2 border-gray-200 bg-slate-50 overflow-hidden focus-within:border-primary focus-within:bg-white transition-colors">
      <div className="flex items-center px-3 border-r border-gray-200 bg-blue-50">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      {children}
    </div>
  );
}

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
        <div className="rounded-2xl overflow-hidden shadow-xl form-card-solid border">
          <div className="bg-gradient-to-r from-primary to-blue-500 px-8 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Customer Account Required</h2>
            <p className="text-white/80 text-sm mt-1">You need a customer profile to post tasks.</p>
          </div>
          <div className="p-6">
            <Button onClick={() => setRole("customer")} className="w-full rounded-xl h-11">Switch to Customer Role</Button>
          </div>
        </div>
      </div>
    );
  }

  const inputCls = "flex-1 px-3 py-0 bg-transparent text-gray-800 text-sm font-medium focus:outline-none h-11";
  const standaloneInputCls = "w-full h-11 px-4 rounded-xl border-2 border-gray-200 bg-slate-50 text-gray-800 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-colors";

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      {/* Page title */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Post a New Task</h1>
        </div>
        <p className="text-gray-500 text-sm ml-[52px]">Verified workers in your city will be notified and can accept your task.</p>
      </div>

      <div className="rounded-2xl overflow-hidden border shadow-lg form-card-solid">
        {/* Section: Task Info */}
        <div className="px-6 pt-5 pb-4 border-b border-blue-100 bg-blue-50/60">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Task Details</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <FieldLabel required>Task Title</FieldLabel>
            <FieldIcon icon={FileText}>
              <input className={inputCls} value={formData.title} onChange={e => updateForm("title", e.target.value)} required placeholder="e.g. Deep clean 3-bedroom apartment" />
            </FieldIcon>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Service Category</FieldLabel>
              <FieldIcon icon={Tag}>
                <select className={`${inputCls} capitalize appearance-none cursor-pointer`} value={formData.category} onChange={e => updateForm("category", e.target.value)} required>
                  <option value="" disabled>Select service type</option>
                  {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </FieldIcon>
            </div>
            <div>
              <FieldLabel required>Budget (PKR)</FieldLabel>
              <FieldIcon icon={DollarSign}>
                <input className={inputCls} type="number" min="0" value={formData.budget} onChange={e => updateForm("budget", e.target.value)} required placeholder="e.g. 5000" />
              </FieldIcon>
            </div>
          </div>

          <div>
            <FieldLabel required>Detailed Description</FieldLabel>
            <textarea
              value={formData.description}
              onChange={e => updateForm("description", e.target.value)}
              required
              rows={4}
              placeholder="What exactly needs to be done? Any tools to bring? Special requirements or preferences?"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-slate-50 text-gray-800 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors resize-none"
            />
          </div>
        </div>

        {/* Section: Location */}
        <div className="px-6 pt-4 pb-3 border-t border-b border-blue-100 bg-blue-50/60">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Location</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>City</FieldLabel>
              <FieldIcon icon={MapPin}>
                <select className={`${inputCls} appearance-none cursor-pointer`} value={formData.city} onChange={e => updateForm("city", e.target.value)} required>
                  <option value="" disabled>Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </FieldIcon>
            </div>
            <div>
              <FieldLabel required>Area / Locality</FieldLabel>
              <FieldIcon icon={MapPin}>
                <input className={inputCls} value={formData.location} onChange={e => updateForm("location", e.target.value)} required placeholder="e.g. DHA Phase 6, Block C" />
              </FieldIcon>
            </div>
          </div>
        </div>

        {/* Section: Schedule */}
        <div className="px-6 pt-4 pb-3 border-t border-b border-blue-100 bg-blue-50/60">
          <p className="text-xs font-bold text-primary uppercase tracking-wider">Schedule</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Duration (Hours)</FieldLabel>
              <FieldIcon icon={Clock}>
                <input className={inputCls} type="number" min="1" value={formData.durationHours} onChange={e => updateForm("durationHours", e.target.value)} required />
              </FieldIcon>
            </div>
            <div>
              <FieldLabel>Preferred Date & Time</FieldLabel>
              <FieldIcon icon={Calendar}>
                <input className={inputCls} type="datetime-local" value={formData.scheduledFor} onChange={e => updateForm("scheduledFor", e.target.value)} />
              </FieldIcon>
            </div>
          </div>
        </div>

        {/* Summary + Submit */}
        {formData.budget && formData.title && (
          <div className="px-6 pb-2">
            <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3.5">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Task Summary</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Budget offered</span>
                <span className="font-bold text-gray-800">PKR {parseInt(formData.budget || "0").toLocaleString()}</span>
              </div>
              {formData.durationHours && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Estimated duration</span>
                  <span className="font-semibold text-gray-800">{formData.durationHours} hour{parseInt(formData.durationHours) !== 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={createTask.isPending}
            className="w-full h-12 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {createTask.isPending ? "Posting task..." : "Post Task Now"}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Verified workers in your area will be notified and can accept your task.
          </p>
        </div>
      </div>
    </div>
  );
}
