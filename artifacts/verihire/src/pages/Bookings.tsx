import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useListBookings, getListBookingsQueryKey } from "@workspace/api-client-react";
import { useRole } from "@/components/RoleContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Calendar, ChevronRight, User, Users } from "lucide-react";

export default function Bookings() {
  const { role, actorId } = useRole();
  const [, navigate] = useLocation();

  const queryParams: any = {};
  if (role === "customer" && actorId) queryParams.customerId = actorId;
  else if (role === "worker" && actorId) queryParams.workerId = actorId;
  
  const { data: bookings, isLoading } = useListBookings(queryParams, {
    query: {
      enabled: !!actorId || role === "admin",
      queryKey: getListBookingsQueryKey(queryParams),
    },
  });

  const statusColors = {
    active: "bg-success/10 text-success border-success/20",
    completed: "bg-muted/30 text-muted-foreground border-border",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20"
  };

  if (!actorId && role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Select a profile to view your bookings.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="page-panel p-6 mb-6 -mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
          <p className="text-muted-foreground mt-1">Manage your monthly hires and attendance.</p>
        </div>
        
        {role === "customer" && (
          <Button onClick={() => navigate("/")} variant="outline" className="rounded-full shadow-sm bg-background">
            Hire Someone New
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => {
            const isCustomer = role === "customer";
            const counterpartyName = isCustomer ? booking.worker?.fullName : booking.customer?.fullName;
            const counterpartyPhoto = isCustomer ? booking.worker?.photoUrl : booking.customer?.photoUrl;
            const counterpartyRole = isCustomer ? booking.worker?.category : "Customer";
            
            return (
              <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border-border/60 flex flex-col cursor-pointer group" onClick={() => navigate(`/bookings/${booking.id}`)}>
                <CardHeader className="bg-muted/10 pb-4 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border bg-background shadow-sm">
                      {counterpartyPhoto ? <AvatarImage src={counterpartyPhoto} className="object-cover" /> : null}
                      <AvatarFallback className="font-semibold text-muted-foreground">
                        {counterpartyName?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{counterpartyName}</h3>
                      <p className="text-sm text-muted-foreground capitalize font-medium">{counterpartyRole}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${statusColors[booking.status]} px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-bold shadow-sm`}>
                    {booking.status}
                  </Badge>
                </CardHeader>
                
                <CardContent className="p-6 flex-1 flex flex-col justify-center gap-6">
                  <div className="grid grid-cols-2 gap-4 divide-x divide-border">
                    <div className="space-y-1 text-center">
                      <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Monthly Salary</p>
                      <p className="text-xl font-bold text-foreground">Rs. {booking.monthlySalary.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Start Date</p>
                      <p className="text-sm font-medium text-foreground mt-1 bg-muted/30 px-3 py-1 rounded-md inline-block">
                        {new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {booking.attendanceSummary && (
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="font-semibold text-primary/80 uppercase tracking-wide text-xs flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Attendance</span>
                        <span className="font-bold text-foreground">Streak: <span className="text-warning">{booking.attendanceSummary.currentStreak} 🔥</span></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-success shadow-sm shadow-success/40" />
                          <span className="text-sm font-medium text-muted-foreground"><strong className="text-foreground">{booking.attendanceSummary.presentDays}</strong> Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-destructive shadow-sm shadow-destructive/40" />
                          <span className="text-sm font-medium text-muted-foreground"><strong className="text-foreground">{booking.attendanceSummary.absentDays}</strong> Absent</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-0 border-t">
                  <div className="w-full bg-muted/20 hover:bg-primary/5 transition-colors p-4 flex items-center justify-center text-primary font-medium text-sm gap-2">
                    View Full Details <ChevronRight className="w-4 h-4" />
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border-2 border-dashed rounded-3xl bg-muted/20 max-w-2xl mx-auto shadow-sm">
          <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border">
            <Briefcase className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-foreground">No active bookings</h3>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
            {role === "customer" 
              ? "You haven't hired anyone yet. Browse our verified workers to find the perfect match." 
              : "You don't have any active jobs right now. Check the task board or update your profile."}
          </p>
          <Button size="lg" className="rounded-xl px-8 shadow-md" onClick={() => navigate(role === "customer" ? "/" : "/tasks")}>
            {role === "customer" ? "Browse Workers" : "Find Open Tasks"}
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
