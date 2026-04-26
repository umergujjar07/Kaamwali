import { Router, type IRouter } from "express";
import { asc, eq, and } from "drizzle-orm";
import { db, attendanceTable } from "@workspace/db";
import {
  CreateAttendanceParams,
  CreateAttendanceBody,
  ListAttendanceParams,
  ListAttendanceResponse,
} from "@workspace/api-zod";
import { serializeAttendance } from "../lib/serializers";

const router: IRouter = Router();

router.get("/bookings/:id/attendance", async (req, res): Promise<void> => {
  const params = ListAttendanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.bookingId, params.data.id))
    .orderBy(asc(attendanceTable.date));
  res.json(ListAttendanceResponse.parse(rows.map(serializeAttendance)));
});

router.post("/bookings/:id/attendance", async (req, res): Promise<void> => {
  const params = CreateAttendanceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = CreateAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const dateStr =
    parsed.data.date instanceof Date
      ? parsed.data.date.toISOString().slice(0, 10)
      : String(parsed.data.date);
  // Upsert by (bookingId, date) — replace existing entry for that day
  const existing = await db
    .select()
    .from(attendanceTable)
    .where(
      and(
        eq(attendanceTable.bookingId, params.data.id),
        eq(attendanceTable.date, dateStr),
      ),
    );
  if (existing.length > 0) {
    const [row] = await db
      .update(attendanceTable)
      .set({
        status: parsed.data.status,
        checkInTime: parsed.data.checkInTime ?? null,
        notes: parsed.data.notes ?? null,
      })
      .where(eq(attendanceTable.id, existing[0]!.id))
      .returning();
    if (!row) {
      res.status(500).json({ error: "Failed to update attendance" });
      return;
    }
    res.status(201).json(serializeAttendance(row));
    return;
  }
  const [row] = await db
    .insert(attendanceTable)
    .values({
      bookingId: params.data.id,
      date: dateStr,
      status: parsed.data.status,
      checkInTime: parsed.data.checkInTime ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create attendance" });
    return;
  }
  res.status(201).json(serializeAttendance(row));
});

export default router;
