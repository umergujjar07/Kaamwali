import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  bookingsTable,
  workersTable,
  customersTable,
  attendanceTable,
  type Attendance,
} from "@workspace/db";
import {
  CreateBookingBody,
  GetBookingParams,
  GetBookingResponse,
  ListBookingsQueryParams,
  ListBookingsResponse,
  UpdateBookingStatusParams,
  UpdateBookingStatusBody,
  UpdateBookingStatusResponse,
} from "@workspace/api-zod";
import { serializeBooking } from "../lib/serializers";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

function computeSummary(attendance: Attendance[]) {
  const sorted = [...attendance].sort((a, b) =>
    a.date < b.date ? -1 : a.date > b.date ? 1 : 0,
  );
  let presentDays = 0;
  let absentDays = 0;
  for (const a of sorted) {
    if (a.status === "present") presentDays += 1;
    else if (a.status === "absent") absentDays += 1;
  }
  // Compute current streak of consecutive present days from most recent backwards
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const a = sorted[i];
    if (a && a.status === "present") currentStreak += 1;
    else break;
  }
  return { presentDays, absentDays, currentStreak };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const params = ListBookingsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conditions = [] as ReturnType<typeof eq>[];
  if (params.data.customerId !== undefined)
    conditions.push(eq(bookingsTable.customerId, params.data.customerId));
  if (params.data.workerId !== undefined)
    conditions.push(eq(bookingsTable.workerId, params.data.workerId));
  if (params.data.status)
    conditions.push(eq(bookingsTable.status, params.data.status));

  const rows = await db
    .select({
      booking: bookingsTable,
      worker: workersTable,
      customer: customersTable,
    })
    .from(bookingsTable)
    .leftJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .leftJoin(customersTable, eq(bookingsTable.customerId, customersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(bookingsTable.createdAt));

  const ids = rows.map((r) => r.booking.id);
  const allAttendance = ids.length
    ? await db
        .select()
        .from(attendanceTable)
        .where(sql`${attendanceTable.bookingId} IN (${sql.join(ids, sql`, `)})`)
    : [];
  const byBooking = new Map<number, Attendance[]>();
  for (const a of allAttendance) {
    const arr = byBooking.get(a.bookingId) ?? [];
    arr.push(a);
    byBooking.set(a.bookingId, arr);
  }

  const out = rows.map((r) =>
    serializeBooking(
      r.booking,
      r.worker ?? undefined,
      r.customer ?? undefined,
      computeSummary(byBooking.get(r.booking.id) ?? []),
    ),
  );
  res.json(ListBookingsResponse.parse(out));
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(bookingsTable)
    .values({
      customerId: parsed.data.customerId,
      workerId: parsed.data.workerId,
      startDate: new Date(parsed.data.startDate),
      monthlySalary: parsed.data.monthlySalary,
      notes: parsed.data.notes ?? null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create booking" });
    return;
  }

  // Mark worker busy
  await db
    .update(workersTable)
    .set({ availability: "busy" })
    .where(eq(workersTable.id, row.workerId));

  const [worker] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, row.workerId));
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, row.customerId));

  await logActivity({
    type: "booking_created",
    title: "Monthly hire confirmed",
    description: `${customer?.fullName ?? "A customer"} hired ${worker?.fullName ?? "a worker"} at PKR ${row.monthlySalary.toLocaleString()}/mo`,
    actorName: customer?.fullName ?? null,
  });

  res
    .status(201)
    .json(
      serializeBooking(row, worker, customer, {
        presentDays: 0,
        absentDays: 0,
        currentStreak: 0,
      }),
    );
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({
      booking: bookingsTable,
      worker: workersTable,
      customer: customersTable,
    })
    .from(bookingsTable)
    .leftJoin(workersTable, eq(bookingsTable.workerId, workersTable.id))
    .leftJoin(customersTable, eq(bookingsTable.customerId, customersTable.id))
    .where(eq(bookingsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  const attendance = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.bookingId, params.data.id));
  res.json(
    GetBookingResponse.parse(
      serializeBooking(
        row.booking,
        row.worker ?? undefined,
        row.customer ?? undefined,
        computeSummary(attendance),
      ),
    ),
  );
});

router.patch("/bookings/:id/status", async (req, res): Promise<void> => {
  const params = UpdateBookingStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  if (parsed.data.status !== "active") {
    await db
      .update(workersTable)
      .set({ availability: "available" })
      .where(eq(workersTable.id, row.workerId));
  }
  if (parsed.data.status === "completed") {
    await db
      .update(workersTable)
      .set({ completedJobs: sql`${workersTable.completedJobs} + 1` })
      .where(eq(workersTable.id, row.workerId));
  }
  const [worker] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, row.workerId));
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, row.customerId));
  const attendance = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.bookingId, row.id));
  res.json(
    UpdateBookingStatusResponse.parse(
      serializeBooking(
        row,
        worker,
        customer,
        computeSummary(attendance),
      ),
    ),
  );
});

export default router;
