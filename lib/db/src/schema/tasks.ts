import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  durationHours: integer("duration_hours").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  budget: integer("budget").notNull(),
  status: text("status").notNull().default("open"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  acceptedByWorkerId: integer("accepted_by_worker_id"),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Task = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;
