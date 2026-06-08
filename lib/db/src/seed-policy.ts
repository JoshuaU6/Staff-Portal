import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { policyVersionsTable } from "./schema/policy.js";
import { desc } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting.");
  process.exit(1);
}

const POLICY_VERSION = "1.0";
const POLICY_BODY = `MTC Group Staff Code of Conduct — Version 1.0
Effective: 17 May 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. INTRODUCTION

MTC Group of Companies ("MTC Group" or "the Company") is committed to upholding the highest standards of integrity, professionalism, and ethical conduct across all its subsidiaries, divisions, and functions. This Staff Code of Conduct ("Code") sets out the standards of behaviour expected of every member of staff, regardless of seniority, location, or employment type.

All staff are required to read, understand, and acknowledge this Code upon joining the Company and whenever a new version is published. Questions about the Code should be directed to your line manager or Human Resources.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. PROFESSIONAL STANDARDS

2.1  Staff must carry out their duties honestly, diligently, and to the best of their abilities.
2.2  Staff must treat all colleagues, clients, partners, and visitors with courtesy and respect.
2.3  Punctuality, reliability, and a commitment to quality are expected at all times.
2.4  Staff must follow all reasonable and lawful instructions from their managers and authorised supervisors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. INTEGRITY AND CONFLICTS OF INTEREST

3.1  Staff must act in the best interests of MTC Group and must not allow personal interests to conflict, or appear to conflict, with their professional responsibilities.
3.2  Any actual or potential conflict of interest must be disclosed promptly to the staff member's line manager and to Human Resources.
3.3  Staff must not accept gifts, entertainment, or other benefits from suppliers, contractors, or clients beyond the thresholds set out in the Company's Gifts and Hospitality Policy.
3.4  MTC Group maintains a zero-tolerance stance on bribery, corruption, and facilitation of tax evasion in all forms, in accordance with applicable laws and regulations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. CONFIDENTIALITY AND DATA PROTECTION

4.1  Staff must protect confidential information belonging to MTC Group, its clients, partners, and employees. This obligation continues after employment ends.
4.2  Staff must comply with all applicable data protection laws and the Company's Data Protection Policy when handling personal data.
4.3  Staff must not access, copy, or disclose information beyond what is necessary for the proper performance of their duties.
4.4  Any suspected data breach or unauthorised disclosure must be reported to the ICT department immediately.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. USE OF COMPANY ASSETS AND SYSTEMS

5.1  Company assets — including premises, equipment, vehicles, software, and systems — are provided for legitimate business use. Incidental personal use is permitted only where it does not impair performance or incur cost to the Company.
5.2  Staff must not use company systems to access, store, or distribute unlawful, offensive, or inappropriate material.
5.3  Staff are responsible for the security of any company equipment assigned to them. Loss or damage must be reported promptly.
5.4  Staff must not install unauthorised software or introduce external devices to company systems without ICT approval.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. EQUAL OPPORTUNITIES AND DIGNITY AT WORK

6.1  MTC Group is committed to a workplace free from discrimination, harassment, and victimisation on any ground, including age, disability, gender, race, religion, nationality, or sexual orientation.
6.2  Staff must treat all individuals with dignity and respect. Bullying, harassment, or any form of discriminatory behaviour will not be tolerated.
6.3  Concerns about discrimination or workplace conduct should be raised through the Company's Grievance Procedure without fear of retaliation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. HEALTH, SAFETY, AND WELLBEING

7.1  Staff must follow all health and safety policies, procedures, and instructions.
7.2  Staff must not attend work, or operate company vehicles or machinery, while impaired by alcohol or controlled substances.
7.3  Staff must report any accident, near-miss, or hazardous condition to their line manager without delay.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. SOCIAL MEDIA AND PUBLIC COMMUNICATIONS

8.1  Staff must not publish statements, comments, or content on social media or in any public forum that could damage the reputation of MTC Group, its clients, or its employees.
8.2  Only authorised spokespersons may make official statements on behalf of MTC Group to the press or external parties.
8.3  Staff are personally responsible for content they post online and must clearly distinguish personal views from Company positions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. REPORTING CONCERNS

9.1  Staff who become aware of a breach or suspected breach of this Code, or of any unlawful activity, are encouraged to report it promptly through the Company's Whistleblowing Policy.
9.2  Reports can be made to a line manager, HR, or through the confidential reporting channel maintained by ICT Administration.
9.3  MTC Group prohibits retaliation against any person who raises a genuine concern in good faith.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. CONSEQUENCES OF BREACH

Breaches of this Code may result in disciplinary action up to and including summary dismissal, and may also give rise to civil or criminal liability depending on the nature of the breach.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

11. ACKNOWLEDGMENT

By acknowledging this Code through the MTC Group Staff Portal, you confirm that:

  (a) you have read and understood the obligations set out above;
  (b) you agree to comply with this Code in full; and
  (c) you understand that breaches may lead to disciplinary action.

If you have any questions about the content of this Code, please contact Human Resources before acknowledging.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issued by: MTC Group Human Resources & ICT Administration
Version: 1.0 | Effective: 17 May 2026`;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const [existing] = await db
    .select()
    .from(policyVersionsTable)
    .orderBy(desc(policyVersionsTable.publishedAt))
    .limit(1);

  if (existing) {
    console.log(`Policy already seeded (current version: ${existing.version}). Nothing to do.`);
    await pool.end();
    return;
  }

  const [inserted] = await db
    .insert(policyVersionsTable)
    .values({
      version: POLICY_VERSION,
      body: POLICY_BODY,
    })
    .returning();

  console.log(`Seeded policy version ${inserted.version} (id: ${inserted.id}).`);
  console.log("All active staff will be shown as Pending until they acknowledge the policy.");

  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
