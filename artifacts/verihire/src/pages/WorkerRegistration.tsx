import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateWorker, getListWorkersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"];
const CATEGORIES = ["maid", "driver", "guard", "cook", "nanny", "gardener", "other"];

export default function WorkerRegistration() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const createWorker = useCreateWorker();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    photoUrl: "",
    category: "",
    skillsInput: "",
    experienceYears: "",
    bio: "",
    serviceArea: "",
    cnicNumber: "",
    cnicImageUrl: "",
    expectedMonthlySalary: "",
    hourlyRate: ""
  });

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.fullName || !formData.phone || !formData.city)) {
      toast.error("Please fill all required fields");
      return;
    }
    if (step === 2 && (!formData.category || !formData.experienceYears)) {
      toast.error("Please fill all required fields");
      return;
    }
    setStep(s => Math.min(3, s + 1));
  };

  const handleBack = () => {
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cnicNumber || !formData.expectedMonthlySalary) {
      toast.error("Please fill all required fields");
      return;
    }

    const skillsArray = formData.skillsInput.split(",").map(s => s.trim()).filter(Boolean);

    createWorker.mutate({
      data: {
        fullName: formData.fullName,
        phone: formData.phone,
        city: formData.city,
        photoUrl: formData.photoUrl || null,
        category: formData.category,
        skills: skillsArray,
        experienceYears: parseInt(formData.experienceYears, 10),
        bio: formData.bio || null,
        serviceArea: formData.serviceArea || null,
        cnicNumber: formData.cnicNumber,
        cnicImageUrl: formData.cnicImageUrl || null,
        expectedMonthlySalary: parseInt(formData.expectedMonthlySalary, 10),
        hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate, 10) : null,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWorkersQueryKey() });
        setSuccess(true);
      },
      onError: (err) => {
        toast.error("Failed to submit registration");
      }
    });
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <Card className="border-success/20 shadow-xl overflow-hidden">
          <div className="bg-success/10 py-12 flex justify-center">
            <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-success" />
            </div>
          </div>
          <CardContent className="pt-8 pb-10 px-6">
            <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
            <p className="text-muted-foreground mb-8">
              Our admin team will review your profile within 24 hours. We'll contact you at {formData.phone} once verified.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/")} className="w-full rounded-xl">Browse other workers</Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full rounded-xl">Back home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Join VeriHire</h1>
        <p className="text-muted-foreground">Register as a trusted worker and find reliable jobs.</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm font-medium text-muted-foreground">
          <span>Step {step} of 3</span>
          <span>{step === 1 ? "Personal" : step === 2 ? "Professional" : "Verification"}</span>
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6">
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="fullName" value={formData.fullName} onChange={e => updateForm("fullName", e.target.value)} required placeholder="e.g. Ali Khan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" value={formData.phone} onChange={e => updateForm("phone", e.target.value)} required placeholder="0300-1234567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                  <Select value={formData.city} onValueChange={v => updateForm("city", v)} required>
                    <SelectTrigger><SelectValue placeholder="Select your city" /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Profile Photo URL (Optional)</Label>
                  <Input id="photoUrl" value={formData.photoUrl} onChange={e => updateForm("photoUrl", e.target.value)} placeholder="https://example.com/my-photo.jpg" />
                  <p className="text-xs text-muted-foreground">Provide a link to a clear, professional photo.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <Select value={formData.category} onValueChange={v => updateForm("category", v)} required>
                    <SelectTrigger><SelectValue placeholder="Select service category" className="capitalize" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Years of Experience <span className="text-destructive">*</span></Label>
                  <Input id="experienceYears" type="number" min="0" value={formData.experienceYears} onChange={e => updateForm("experienceYears", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills (Comma separated)</Label>
                  <Input id="skills" value={formData.skillsInput} onChange={e => updateForm("skillsInput", e.target.value)} placeholder="e.g. driving, auto manual, car wash" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceArea">Service Area</Label>
                  <Input id="serviceArea" value={formData.serviceArea} onChange={e => updateForm("serviceArea", e.target.value)} placeholder="e.g. DHA, Clifton" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About Me</Label>
                  <Textarea id="bio" value={formData.bio} onChange={e => updateForm("bio", e.target.value)} placeholder="Briefly describe your experience and work ethic..." className="h-24" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="w-5 h-5 text-primary" /> Identity Verification</h3>
                  <p className="text-sm text-muted-foreground">Your CNIC details are required for trust and safety but will remain partially hidden on your public profile.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnicNumber">CNIC Number <span className="text-destructive">*</span></Label>
                  <Input id="cnicNumber" value={formData.cnicNumber} onChange={e => updateForm("cnicNumber", e.target.value)} required placeholder="12345-1234567-1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnicImageUrl">CNIC Photo URL</Label>
                  <Input id="cnicImageUrl" value={formData.cnicImageUrl} onChange={e => updateForm("cnicImageUrl", e.target.value)} placeholder="https://..." />
                  <p className="text-xs text-muted-foreground">Paste a URL to your CNIC photo</p>
                </div>
                
                <hr className="my-6 border-border" />
                <h3 className="font-semibold mb-4">Pricing</h3>

                <div className="space-y-2">
                  <Label htmlFor="expectedMonthlySalary">Expected Monthly Salary (PKR) <span className="text-destructive">*</span></Label>
                  <Input id="expectedMonthlySalary" type="number" min="0" value={formData.expectedMonthlySalary} onChange={e => updateForm("expectedMonthlySalary", e.target.value)} required placeholder="e.g. 25000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (PKR) (Optional)</Label>
                  <Input id="hourlyRate" type="number" min="0" value={formData.hourlyRate} onChange={e => updateForm("hourlyRate", e.target.value)} placeholder="e.g. 500" />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6 mt-8 border-t">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="w-1/3 rounded-xl gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              {step < 3 ? (
                <Button type="submit" className={`rounded-xl gap-2 ${step === 1 ? "w-full" : "w-2/3"}`}>
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={createWorker.isPending} className="w-2/3 rounded-xl gap-2 bg-success hover:bg-success/90 text-success-foreground ml-auto">
                  {createWorker.isPending ? "Submitting..." : "Submit Registration"} <ShieldCheck className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
