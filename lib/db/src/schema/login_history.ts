import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const loginHistoryTable = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  ipAddress: text("ip_address"),
  country: text("country"),
  deviceFingerprint: text("device_fingerprint"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull().default(true),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LoginHistory = typeof loginHistoryTable.$inferSelect;
