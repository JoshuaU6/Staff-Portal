import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "MTC Regional Specialist Hospital",
    description:
      "MTC Group owns and runs a multi-speciality hospital serving a regional catchment across West Africa. The facility delivers cardiology, oncology, orthopaedic, and maternal health services, built and equipped to international clinical standards.",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&q=80",
    tags: ["Hospital", "Multi-Speciality"],
  },
  {
    title: "Advanced Diagnostic & Imaging Centre",
    description:
      "MTC Group oversees a purpose-built diagnostic hub delivering MRI, CT, ultrasound, laboratory, and pathology services. Our facilities close patient referral gaps and bring advanced imaging infrastructure to regional healthcare markets.",
    image: "https://images.unsplash.com/photo-1516069677018-378515003435?w=1000&q=80",
    tags: ["Diagnostics", "Medical Imaging"],
  },
  {
    title: "Primary Care Clinic Network",
    description:
      "MTC Group owns and runs a network of primary care clinics across peri-urban communities, delivering general practice, preventive care, maternal and child health, and pharmacy services. Our clinic network brings structured healthcare access to underserved populations.",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1000&q=80",
    tags: ["Primary Care", "Community Health"],
  },
  {
    title: "Clinical Equipment Procurement & Installation",
    description:
      "MTC Group procures and installs medical equipment across its hospital and clinic network — from surgical theatres and ICU units to laboratory systems and digital radiology. All equipment is sourced from globally recognised medical technology manufacturers to international clinical standards.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1000&q=80",
    tags: ["Medical Equipment", "Clinical Infrastructure"],
  },
];

const capabilities = [
  "Hospital development and operations management",
  "Clinical equipment procurement and installation",
  "Specialist clinic and diagnostic centre operations",
  "Primary healthcare network management",
  "Healthcare facility development and investment",
  "Pharmaceutical supply chain management",
  "Healthcare workforce training and development",
];

export default function Healthcare() {
  return (
    <SectorDetailLayout
      sectorName="Healthcare"
      sectorSlug="healthcare"
      tagline="Owning and operating world-class hospitals, diagnostic centres, and primary care networks across Africa."
      overview="MTC Group's Healthcare division owns, develops, and operates specialist hospitals, diagnostic centres, and primary care networks across Africa. Our facilities deliver cardiology, oncology, diagnostics, and community health services to populations across West Africa — built to international clinical standards and managed with operational discipline. MTC Group controls both development and operations across its healthcare portfolio, building the facilities, equipment, and workforce capability needed to deliver measurable health outcomes."
      heroImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&q=80"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
