import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const jobPostingsTable = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull().default("Full-time"),       // Full-time, Part-time, Contract
  level: text("level").notNull().default("Mid-level"),    // Senior, Mid-level, Junior, Management
  description: text("description").notNull(),
  requirements: text("requirements"),
  status: text("status").notNull().default("draft"),      // draft, published, closed
  createdBy: integer("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobApplicationsTable = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobPostingsTable.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),                  // denormalised for display after job deletion
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  linkedin: text("linkedin"),
  coverLetter: text("cover_letter"),
  cvUrl: text("cv_url"),                                  // Formspree file URL or base64 ref
  cvFileName: text("cv_file_name"),
  status: text("status").notNull().default("new"),       // new, reviewing, shortlisted, rejected
  notes: text("notes"),                                   // HR internal notes
  reviewedBy: integer("reviewed_by").references(() => usersTable.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertJobPostingSchema = createInsertSchema(jobPostingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostingsTable.$inferSelect;

export const insertJobApplicationSchema = createInsertSchema(jobApplicationsTable).omit({ id: true, appliedAt: true });
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplicationsTable.$inferSelect;