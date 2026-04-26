import React from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, ShieldCheck, Star, Clock } from "lucide-react";
import type { Worker } from "@workspace/api-client-react";

export function WorkerCard({ worker }: { worker: Worker }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 border-border/50 group flex flex-col h-full">
      <CardHeader className="p-0 relative">
        <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 w-full absolute top-0 left-0" />
        <div className="px-6 pt-6 pb-2 relative z-10 flex items-start justify-between">
          <Avatar className="w-16 h-16 border-4 border-background shadow-sm bg-muted">
            {worker.photoUrl ? (
              <AvatarImage src={worker.photoUrl} alt={worker.fullName} className="object-cover" />
            ) : null}
            <AvatarFallback className="text-xl font-medium text-muted-foreground">
              {worker.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {worker.verificationStatus === "approved" && (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1 rounded-full px-3 py-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-6 py-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
              {worker.fullName}
            </h3>
            <p className="text-sm font-medium text-primary capitalize">{worker.category}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : "New"}
          </div>
        </div>

        <div className="space-y-2 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0 text-muted-foreground/70" />
            <span className="truncate">{worker.city} {worker.serviceArea ? `• ${worker.serviceArea}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0 text-muted-foreground/70" />
            <span>{worker.experienceYears} years experience</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {worker.skills.slice(0, 3).map(skill => (
            <Badge key={skill} variant="outline" className="bg-accent/50 text-accent-foreground border-none font-normal text-xs rounded">
              {skill}
            </Badge>
          ))}
          {worker.skills.length > 3 && (
            <Badge variant="outline" className="bg-accent/50 text-accent-foreground border-none font-normal text-xs rounded">
              +{worker.skills.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Monthly</span>
          <span className="font-semibold text-foreground">
            {worker.expectedMonthlySalary ? `Rs. ${worker.expectedMonthlySalary.toLocaleString()}` : 'Negotiable'}
          </span>
        </div>
        <Link href={`/workers/${worker.id}`} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          View Profile &rarr;
        </Link>
      </CardFooter>
    </Card>
  );
}
