import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";

export const workersTable = pgTable("workers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  photoUrl: text("photo_url"),
  category: text("category").notNull(),
  skills: text("skills").array().notNull().default([]),
  bio: text("bio"),
  experienceYears: integer("experience_years").notNull().default(0),
  expectedMonthlySalary: integer("expected_monthly_salary"),
  hourlyRate: integer("hourly_rate"),
  city: text("city").notNull(),
  serviceArea: text("service_area"),
  cnicNumber: text("cnic_number").notNull(),
  cnicImageUrl: text("cnic_image_url"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 })
    .notNull()
    .default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  completedJobs: integer("completed_jobs").notNull().default(0),
  availability: text("availability").notNull().default("available"),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Worker = typeof workersTable.$inferSelect;
export type InsertWorker = typeof workersTable.$inferInsert;
