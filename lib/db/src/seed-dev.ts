/**
 * Development seed: departments + test users for every role.
 * Safe to re-run — skips departments/users that already exist.
 *
 * Usage: npm run seed-dev -w @workspace/db
 *
 * After running this seed, register in Clerk at /portal/register using
 * any of the test email addresses below. The system will auto-link your
 * Clerk account to the pre-created staff record on first login.
 *
 * Test accounts:
 *   chairman@mtc-groups.com       role: chairman        (Level 1)
 *   ict@mtc-groups.com            role: ict_admin        (Level 2)
 *   hr@mtc-groups.com             role: hr_admin         (Level 2)
 *   compliance@mtc-groups.com     role: compliance_admin (Compliance)
 *   auditor@mtc-groups.com        role: auditor          (Read-only)
 *   depthead@mtc-groups.com       role: department_head  (Level 3)
 *   manager@mtc-groups.com        role: manager          (Level 3)
 *   supervisor@mtc-groups.com     role: supervisor       (Level 3)
 *   staff@mtc-groups.com          role: staff            (Level 4)
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { departmentsTable, usersTable } from "./schema/users.js";
import { eq } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// ─── Department structure from client requirements ────────────────────────────
const TOP_LEVEL_DEPARTMENTS = [
  "Executive Management",
  "Corporate Administration",
  "Human Resources",
  "Finance & Accounting",
  "Legal & Compliance",
  "Logistics & Supply Chain",
  "Real Estate & Infrastructure",
  "Marketing & Communications",
  "ICT Department",
];

const SUB_DEPARTMENTS: Record<string, string[]> = {
  "MainKey Limited": [
    "Crude Oil Trading",
    "Petroleum Products Trading",
    "LNG / LPG Trading",
    "Commodity Trading",
  ],
  "Safwad Limited": [
    "Import Division",
    "Export Division",
    "Agriculture Division",
    "Consumer Products Division",
  ],
};

// ─── Test users (one per role) ────────────────────────────────────────────────
// All created as status="active" so they work immediately on first Clerk login.
// clerkUserId is NULL — auto-linked by email when the user first signs in.
const TEST_USERS = [
  { staffId: "MTC-CHAIR-001", email: "chairman@mtc-groups.com",   fullName: "A.S. Abba",          role: "chairman",         deptName: "Executive Management" },
  { staffId: "MTC-ICT-001",   email: "ict@mtc-groups.com",        fullName: "ICT Administrator",  role: "ict_admin",        deptName: "ICT Department" },
  { staffId: "MTC-HR-001",    email: "hr@mtc-groups.com",         fullName: "HR Administrator",   role: "hr_admin",         deptName: "Human Resources" },
  { staffId: "MTC-COMP-001",  email: "compliance@mtc-groups.com", fullName: "Compliance Officer", role: "compliance_admin", deptName: "Legal & Compliance" },
  { staffId: "MTC-AUD-001",   email: "auditor@mtc-groups.com",    fullName: "Internal Auditor",   role: "auditor",          deptName: "Finance & Accounting" },
  { staffId: "MTC-DH-001",    email: "depthead@mtc-groups.com",   fullName: "Department Head",    role: "department_head",  deptName: "Corporate Administration" },
  { staffId: "MTC-MGR-001",   email: "manager@mtc-groups.com",    fullName: "Team Manager",       role: "manager",          deptName: "Marketing & Communications" },
  { staffId: "MTC-SUP-001",   email: "supervisor@mtc-groups.com", fullName: "Team Supervisor",    role: "supervisor",       deptName: "Logistics & Supply Chain" },
  { staffId: "MTC-STAFF-001", email: "staff@mtc-groups.com",      fullName: "Test Staff Member",  role: "staff",            deptName: "Finance & Accounting" },
];

async function main() {
  console.log("=== MTC Group Dev Seed ===\n");

  // ── 1. Departments ───────────────────────────────────────────────────────────
  console.log("Seeding departments...");

  const deptNameToId = new Map<string, number>();

  // Existing departments
  const existing = await db.select().from(departmentsTable);
  for (const d of existing) deptNameToId.set(d.name, d.id);

  // Top-level departments
  for (const name of TOP_LEVEL_DEPARTMENTS) {
    if (deptNameToId.has(name)) {
      console.log(`  [skip] ${name}`);
      continue;
    }
    const [row] = await db.insert(departmentsTable).values({ name }).returning();
    deptNameToId.set(row.name, row.id);
    console.log(`  [+] ${name} (id: ${row.id})`);
  }

  // Sub-departments under MainKey Limited and Safwad Limited
  for (const [parentName, children] of Object.entries(SUB_DEPARTMENTS)) {
    // Ensure parent exists
    if (!deptNameToId.has(parentName)) {
      const [parent] = await db.insert(departmentsTable).values({ name: parentName }).returning();
      deptNameToId.set(parent.name, parent.id);
      console.log(`  [+] ${parentName} (id: ${parent.id})`);
    }
    const parentId = deptNameToId.get(parentName)!;

    for (const childName of children) {
      if (deptNameToId.has(childName)) {
        console.log(`  [skip] ${childName}`);
        continue;
      }
      const [child] = await db
        .insert(departmentsTable)
        .values({ name: childName, parentDepartmentId: parentId })
        .returning();
      deptNameToId.set(child.name, child.id);
      console.log(`  [+] ${childName} → ${parentName} (id: ${child.id})`);
    }
  }

  // ── 2. Test users ────────────────────────────────────────────────────────────
  console.log("\nSeeding test users...");

  for (const u of TEST_USERS) {
    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, u.email));

    if (existing) {
      console.log(`  [skip] ${u.email} (already exists, status: ${existing.status})`);
      continue;
    }

    const departmentId = deptNameToId.get(u.deptName) ?? null;
    const [row] = await db
      .insert(usersTable)
      .values({
        staffId: u.staffId,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        status: "active",
        departmentId,
      })
      .returning();

    console.log(`  [+] ${row.email} (${row.role}, dept: ${u.deptName}, id: ${row.id})`);
  }

  console.log("\n=== Done ===");
  console.log("\nTo activate a test account:");
  console.log("  1. Go to /portal/register");
  console.log("  2. Sign up with one of the test email addresses listed above");
  console.log("  3. The portal auto-links your Clerk account on first login");
  console.log("\nTest emails:");
  for (const u of TEST_USERS) {
    console.log(`  ${u.email.padEnd(32)} [${u.role}]`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
