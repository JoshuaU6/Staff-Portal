import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "National Road Corridor Development",
    description:
      "MTC Group's civil engineering teams execute large-scale road network development across the region — national highway corridors, urban access roads, and arterial infrastructure. Works encompass subgrade preparation, pavement construction, drainage systems, and road furniture to international engineering standards.",
    image: "/media/img2.jpg",
    tags: ["Roads", "Civil Works"],
  },
  {
    title: "Bridge & Structural Overpass Works",
    description:
      "MTC Group executes complex bridge and overpass construction projects from design and piling through deck construction and finishing. Our teams handle structural steel and reinforced concrete bridge works across varied terrain and environmental conditions.",
    image: "/media/img3.jpg",
    tags: ["Bridge", "Civil Engineering"],
  },
  {
    title: "Mass Excavation & Earthworks",
    description:
      "MTC Group's plant and equipment fleet drives large-scale earthworks and mass excavation across major development programmes. Operations cover cut-and-fill, site levelling, and terrain preparation for infrastructure, industrial, and real estate projects across the MENA region.",
    image: "/media/img10.jpg",
    tags: ["Earthworks", "Excavation"],
  },
  {
    title: "Structural Steel & Heavy Lift Operations",
    description:
      "MTC Group's infrastructure teams oversee structural steel fabrication, erection, and heavy lift operations for bridges, buildings, and industrial structures. A modern crane and lifting fleet is managed by certified rigging engineers to international lift planning standards.",
    image: "/media/img11.jpg",
    tags: ["Structural Steel", "Heavy Lift"],
  },
  {
    title: "Utility Corridor & Infrastructure Trenching",
    description:
      "MTC Group executes utility corridor development and civil trench works for water, drainage, and communications infrastructure. Our teams handle trench excavation, bedding, backfill, and reinstatement to the highest engineering specifications — on time and to scope.",
    image: "/media/img6.jpg",
    tags: ["Utility", "Civil Infrastructure"],
  },
];

const capabilities = [
  "Road network design, construction and rehabilitation",
  "Bridge and overpass engineering and construction",
  "Civil earthworks — mass excavation, grading and fill",
  "Structural steel fabrication and heavy lifts",
  "Utility corridor construction and trenching",
  "Multi-discipline EPC project management",
  "HSE management systems for civil works",
  "Heavy plant fleet management and logistics",
];

export default function Infrastructure() {
  return (
    <SectorDetailLayout
      sectorName="Infrastructure"
      sectorSlug="infrastructure"
      tagline="Delivering roads, bridges, civil earthworks, and large-scale structural construction across Africa and the Middle East."
      overview="Infrastructure is MTC Group's established civil engineering and construction domain. Our teams execute roads, bridges, structural works, and large-scale civil construction across the MENA region — combining seasoned engineering expertise with a modern fleet of heavy plant. MTC Group handles infrastructure projects of any scale, from national highway corridors and bridge structures to mass earthworks and utility trenching, serving government programmes, property developers, industrial clients, and national infrastructure authorities."
      heroImage="/media/img3.jpg"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
