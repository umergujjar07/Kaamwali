import type {
  Worker,
  Customer,
  Booking,
  Attendance,
  Task,
  Review,
  Activity,
} from "@workspace/db";

export function serializeWorker(w: Worker) {
  return {
    id: w.id,
    fullName: w.fullName,
    phone: w.phone,
    photoUrl: w.photoUrl ?? null,
    category: w.category,
    skills: w.skills ?? [],
    bio: w.bio ?? null,
    experienceYears: w.experienceYears,
    expectedMonthlySalary: w.expectedMonthlySalary ?? null,
    hourlyRate: w.hourlyRate ?? null,
    city: w.city,
    serviceArea: w.serviceArea ?? null,
    cnicNumber: w.cnicNumber,
    cnicImageUrl: w.cnicImageUrl ?? null,
    verificationStatus: w.verificationStatus,
    rejectionReason: w.rejectionReason ?? null,
    averageRating: Number(w.averageRating ?? 0),
    reviewCount: w.reviewCount,
    completedJobs: w.completedJobs,
    availability: w.availability,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  };
}

export function serializeCustomer(c: Customer) {
  return {
    id: c.id,
    fullName: c.fullName,
    phone: c.phone,
    city: c.city,
    photoUrl: c.photoUrl ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

export function serializeAttendance(a: Attendance) {
  const dateStr =
    typeof a.date === "string"
      ? a.date.length >= 10
        ? a.date.slice(0, 10)
        : a.date
      : new Date(a.date as unknown as string).toISOString().slice(0, 10);
  return {
    id: a.id,
    bookingId: a.bookingId,
    date: dateStr,
    status: a.status,
    checkInTime: a.checkInTime ?? null,
    notes: a.notes ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}

export interface AttendanceSummary {
  presentDays: number;
  absentDays: number;
  currentStreak: number;
}

export function serializeBooking(
  b: Booking,
  worker?: Worker,
  customer?: Customer,
  attendanceSummary?: AttendanceSummary,
) {
  return {
    id: b.id,
    customerId: b.customerId,
    workerId: b.workerId,
    startDate: b.startDate.toISOString(),
    monthlySalary: b.monthlySalary,
    status: b.status,
    notes: b.notes ?? null,
    worker: worker ? serializeWorker(worker) : undefined,
    customer: customer ? serializeCustomer(customer) : undefined,
    attendanceSummary: attendanceSummary ?? undefined,
    createdAt: b.createdAt.toISOString(),
  };
}

export function serializeTask(t: Task, customer?: Customer, worker?: Worker) {
  return {
    id: t.id,
    customerId: t.customerId,
    title: t.title,
    description: t.description,
    category: t.category,
    durationHours: t.durationHours,
    location: t.location,
    city: t.city,
    budget: t.budget,
    status: t.status,
    scheduledFor: t.scheduledFor ? t.scheduledFor.toISOString() : null,
    acceptedByWorkerId: t.acceptedByWorkerId ?? null,
    acceptedAt: t.acceptedAt ? t.acceptedAt.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    customer: customer ? serializeCustomer(customer) : undefined,
    worker: worker ? serializeWorker(worker) : undefined,
    createdAt: t.createdAt.toISOString(),
  };
}

export function serializeReview(r: Review, customer?: Customer) {
  return {
    id: r.id,
    workerId: r.workerId,
    customerId: r.customerId,
    bookingId: r.bookingId ?? null,
    taskId: r.taskId ?? null,
    rating: r.rating,
    comment: r.comment ?? null,
    customer: customer ? serializeCustomer(customer) : undefined,
    createdAt: r.createdAt.toISOString(),
  };
}

export function serializeActivity(a: Activity) {
  return {
    id: String(a.id),
    type: a.type,
    title: a.title,
    description: a.description,
    actorName: a.actorName ?? null,
    createdAt: a.createdAt.toISOString(),
  };
}
