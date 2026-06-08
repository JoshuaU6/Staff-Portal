import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorUserId: integer("actor_user_id"),
  eventType: text("event_type").notNull(),
  targetType: text("target_type"),
  targetId: integer("target_id"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const securityAlertsTable = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  severity: text("severity").notNull().default("low"),
  userId: integer("user_id"),
  eventRef: text("event_ref"),
  status: text("status").notNull().default("open"),
  source: text("source").notNull().default("manual"),
  ipAddress: text("ip_address"),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;

export const insertSecurityAlertSchema = createInsertSchema(securityAlertsTable).omit({ id: true, createdAt: true });
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
export type SecurityAlert = typeof securityAlertsTable.$inferSelect;
