import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "International School Campus",
    description:
      "MTC Group develops and runs an international school campus offering British and IB curricula from nursery through sixth form. The campus features science and technology labs, sports facilities, performing arts spaces, and residential boarding — built and managed to international academic standards.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000&q=80",
    tags: ["International School", "K-12"],
  },
  {
    title: "Vocational & Technical Training Academy",
    description:
      "MTC Group oversees a vocational training academy offering certified programmes in pipefitting, electrical engineering, welding, and industrial automation. The institute directly feeds the skills pipeline for Nigeria's oil & gas, construction, and manufacturing sectors.",
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1000&q=80",
    tags: ["Vocational Training", "Skills Development"],
  },
  {
    title: "Applied Research & Innovation Centre",
    description:
      "MTC Group maintains a research centre focused on sustainable energy, environmental engineering, and digital infrastructure — aligned with leading international universities. The centre bridges academic research with industrial application across MTC's core business sectors.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=1000&q=80",
    tags: ["Research", "Innovation"],
  },
  {
    title: "E-Learning & Digital Literacy Platform",
    description:
      "MTC Group's Education division deploys e-learning platforms and digital literacy programmes across community schools in rural and peri-urban areas. Our digital education platform closes the skills gap and aligns with national government education mandates.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&q=80",
    tags: ["E-Learning", "Digital Literacy"],
  },
];

const capabilities = [
  "International school campus development and management",
  "Vocational and technical training institute operations",
  "Applied research centre development",
  "E-learning platform deployment and management",
  "Educational facility investment and construction",
  "Scholarship and talent development programmes",
  "Workforce training for energy and infrastructure sectors",
];

export default function Education() {
  return (
    <SectorDetailLayout
      sectorName="Education"
      sectorSlug="education"
      tagline="Developing and running world-class schools, vocational academies, research centres, and digital learning infrastructure across Africa."
      overview="MTC Group's Education division develops, owns, and runs educational institutions across Africa — from international K-12 schools and vocational training academies to university-aligned research centres. By combining international academic standards with locally grounded delivery, MTC's education programme bridges the skills gap in West Africa's growing economies and builds the next generation of professionals, engineers, and technical specialists. MTC Group's education assets are directly aligned with its core sectors — energy, infrastructure, and technology — creating a structured talent pipeline for the group and the wider market."
      heroImage="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=80"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
