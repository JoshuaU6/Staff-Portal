import { pgTable, text, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const policyVersionsTable = pgTable("policy_versions", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  publishedBy: integer("published_by").references(() => usersTable.id, { onDelete: "set null" }),
});

export const policyAcknowledgmentsTable = pgTable("policy_acknowledgments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  policyVersionId: integer("policy_version_id").notNull().references(() => policyVersionsTable.id, { onDelete: "cascade" }),
  acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("uq_policy_ack_user_version").on(t.userId, t.policyVersionId),
]);

export const insertPolicyVersionSchema = createInsertSchema(policyVersionsTable).omit({ id: true, publishedAt: true });
export type InsertPolicyVersion = z.infer<typeof insertPolicyVersionSchema>;
export type PolicyVersion = typeof policyVersionsTable.$inferSelect;

export const insertPolicyAcknowledgmentSchema = createInsertSchema(policyAcknowledgmentsTable).omit({ id: true, acknowledgedAt: true });
export type InsertPolicyAcknowledgment = z.infer<typeof insertPolicyAcknowledgmentSchema>;
export type PolicyAcknowledgment = typeof policyAcknowledgmentsTable.$inferSelect;
