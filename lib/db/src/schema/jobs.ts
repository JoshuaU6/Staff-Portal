import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const jobPostingsTable = pgTable("job_postings", {
  id: serial("id").primaryKey(),
  jobId: text("job_id"),
  title: text("title").notNull(),
  department: text("department").notNull(),
  division: text("division"),
  location: text("location").notNull(),
  country: text("country"),
  type: text("type").notNull().default("Full-time"),
  level: text("level").notNull().default("Mid-level"),
  workMode: text("work_mode").default("On-site"),
  description: text("description").notNull(),
  responsibilities: text("responsibilities"),
  requirements: text("requirements"),
  benefits: text("benefits"),
  deadline: timestamp("deadline", { withTimezone: true }),
  status: text("status").notNull().default("draft"),
  createdBy: integer("created_by").references(() => usersTable.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobApplicationsTable = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  applicationId: text("application_id"),
  jobId: integer("job_id").references(() => jobPostingsTable.id, { onDelete: "set null" }),
  jobTitle: text("job_title").notNull(),
  jobRef: text("job_ref"),

  // Personal
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"),
  gender: text("gender"),
  nationality: text("nationality"),
  countryOfResidence: text("country_of_residence"),
  cityOfResidence: text("city_of_residence"),
  address: text("address"),

  // Position
  division: text("division"),
  employmentType: text("employment_type"),
  expectedSalary: text("expected_salary"),
  noticePeriod: text("notice_period"),
  currentEmployer: text("current_employer"),
  currentJobTitle: text("current_job_title"),

  // Experience
  yearsOfExperience: text("years_of_experience"),
  industryExperience: text("industry_experience"),
  keySkills: text("key_skills"),
  linkedin: text("linkedin"),
  portfolioUrl: text("portfolio_url"),

  // Education
  highestEducation: text("highest_education"),
  fieldOfStudy: text("field_of_study"),
  university: text("university"),
  graduationYear: text("graduation_year"),

  // Certifications
  certifications: jsonb("certifications"),

  // Mobility
  willingToRelocate: boolean("willing_to_relocate"),
  relocationCountries: text("relocation_countries"),
  hasValidPassport: boolean("has_valid_passport"),
  passportExpiry: text("passport_expiry"),
  requiresVisaSponsorship: boolean("requires_visa_sponsorship"),
  currentVisaStatus: text("current_visa_status"),

  // Screening
  heardAboutUs: text("heard_about_us"),
  whyMTC: text("why_mtc"),
  availableStartDate: text("available_start_date"),
  hasDisability: boolean("has_disability"),
  disabilityDetails: text("disability_details"),
  addToTalentPool: boolean("add_to_talent_pool").default(false),

  // References
  reference1Name: text("reference1_name"),
  reference1Title: text("reference1_title"),
  reference1Company: text("reference1_company"),
  reference1Email: text("reference1_email"),
  reference1Phone: text("reference1_phone"),
  reference2Name: text("reference2_name"),
  reference2Title: text("reference2_title"),
  reference2Company: text("reference2_company"),
  reference2Email: text("reference2_email"),
  reference2Phone: text("reference2_phone"),

  // Documents
  cvUrl: text("cv_url"),
  cvFileName: text("cv_file_name"),
  coverLetter: text("cover_letter"),

  // Declarations
  consentGiven: boolean("consent_given").default(false),
  declarationAccepted: boolean("declaration_accepted").default(false),
  backgroundCheckConsent: boolean("background_check_consent").default(false),

  // HR
  status: text("status").notNull().default("new"),
  assignedTo: integer("assigned_to").references(() => usersTable.id, { onDelete: "set null" }),
  reviewedBy: integer("reviewed_by").references(() => usersTable.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jobApplicationNotesTable = pgTable("job_application_notes", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobApplicationsTable.id, { onDelete: "cascade" }),
  authorId: integer("author_id").references(() => usersTable.id, { onDelete: "set null" }),
  authorName: text("author_name"),
  note: text("note").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type JobPosting = typeof jobPostingsTable.$inferSelect;
export type JobApplication = typeof jobApplicationsTable.$inferSelect;
export type JobApplicationNote = typeof jobApplicationNotesTable.$inferSelect;