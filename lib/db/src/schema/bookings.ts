import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  workerId: integer("worker_id").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  monthlySalary: integer("monthly_salary").notNull(),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Booking = typeof bookingsTable.$inferSelect;
export type InsertBooking = typeof bookingsTable.$inferInsert;
