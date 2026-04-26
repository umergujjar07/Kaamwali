import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  date,
} from "drizzle-orm/pg-core";

export const attendanceTable = pgTable("attendance", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(),
  checkInTime: text("check_in_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Attendance = typeof attendanceTable.$inferSelect;
export type InsertAttendance = typeof attendanceTable.$inferInsert;
