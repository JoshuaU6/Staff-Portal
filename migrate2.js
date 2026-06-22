const { Pool } = require('pg');
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_5YVfTtHWQgE7@ep-icy-firefly-apke13ta-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

async function run() {
  console.log("Running migration...");

  // Add new columns to job_postings
  const jobCols = [
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS job_id TEXT UNIQUE",
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS division TEXT",
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS country TEXT",
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS work_mode TEXT DEFAULT 'On-site'",
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS responsibilities TEXT",
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS benefits TEXT",
    "ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ",
  ];

  // Add new columns to job_applications
  const appCols = [
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS application_id TEXT UNIQUE",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS job_ref TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS date_of_birth TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS gender TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS nationality TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS country_of_residence TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS city_of_residence TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS address TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS division TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS employment_type TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS expected_salary TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS notice_period TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS current_employer TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS current_job_title TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS years_of_experience TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS industry_experience TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS key_skills TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS portfolio_url TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS highest_education TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS field_of_study TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS university TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS graduation_year TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS certifications JSONB",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS willing_to_relocate BOOLEAN",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS relocation_countries TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS has_valid_passport BOOLEAN",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS passport_expiry TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS requires_visa_sponsorship BOOLEAN",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS current_visa_status TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS heard_about_us TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS why_mtc TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS available_start_date TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS has_disability BOOLEAN",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS disability_details TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS add_to_talent_pool BOOLEAN DEFAULT FALSE",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference1_name TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference1_title TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference1_company TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference1_email TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference1_phone TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference2_name TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference2_title TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference2_company TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference2_email TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS reference2_phone TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS cover_letter TEXT",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN DEFAULT FALSE",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS background_check_consent BOOLEAN DEFAULT FALSE",
    "ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS assigned_to INTEGER",
  ];

  // Create notes table
  const notesTbl = `
    CREATE TABLE IF NOT EXISTS job_application_notes (
      id SERIAL PRIMARY KEY,
      application_id INTEGER REFERENCES job_applications(id) ON DELETE CASCADE,
      author_id INTEGER,
      author_name TEXT,
      note TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  for (const sql of [...jobCols, ...appCols]) {
    try {
      await pool.query(sql);
      console.log("✓", sql.split(" ADD COLUMN IF NOT EXISTS ")[1]?.split(" ")[0] ?? sql.substring(0, 50));
    } catch (e) {
      console.error("✗", e.message);
    }
  }

  await pool.query(notesTbl);
  console.log("✓ job_application_notes table");

  console.log("\nMigration complete!");
  await pool.end();
}

run().catch(e => { console.error(e); pool.end(); });
