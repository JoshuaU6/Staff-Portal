import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "Class-A Commercial Tower – Abuja",
    description:
      "MTC Group's Real Estate division develops and manages a premium-grade commercial tower in Abuja's central business district. Built to Class-A international specifications, the asset delivers grade office spaces, retail podiums, and integrated parking for Nigeria's corporate market.",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1000&q=80",
    tags: ["Commercial", "Class-A Office"],
  },
  {
    title: "Master-Planned Residential Estate",
    description:
      "MTC Group develops and manages master-planned mixed-use estates offering contemporary apartments, townhouses, and amenity-rich communal spaces across West Africa. Each development prioritises sustainable design, community integration, and enduring asset value.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=80",
    tags: ["Residential", "Mixed-Use"],
  },
  {
    title: "Industrial Logistics & Warehousing Park",
    description:
      "MTC Group develops and controls purpose-built warehousing and logistics infrastructure across West Africa. Our parks offer bonded storage, cold chain capability, and heavy vehicle access — configured for trading, distribution, and logistics operators.",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1000&q=80",
    tags: ["Industrial", "Logistics"],
  },
  {
    title: "Flagship Hotel & Serviced Residences",
    description:
      "MTC Group develops and manages branded hotel assets and fully serviced long-stay residences, targeting corporate travellers and international investors across Nigeria's growing hospitality market.",
    image: "https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1000&q=80",
    tags: ["Hospitality", "Serviced Residences"],
  },
];

const capabilities = [
  "Commercial real estate development and asset management",
  "Residential master-planning and construction",
  "Industrial and logistics real estate operations",
  "Hospitality and serviced residence development",
  "Real estate investment structuring",
  "Portfolio property management",
  "Strategic land acquisition and development",
];

export default function RealEstate() {
  return (
    <SectorDetailLayout
      sectorName="Real Estate"
      sectorSlug="real-estate"
      tagline="Developing and managing premium real estate across West Africa — commercial towers, residential estates, logistics parks, and hospitality assets."
      overview="MTC Group's Real Estate division develops, owns, and manages a portfolio of commercial, residential, industrial, and hospitality assets across West Africa. The division commands strategic land acquisition, international design standards, and disciplined project management — delivering real estate assets with strong market demand and sustained long-term value. MTC Group executes as principal developer across its real estate portfolio, controlling acquisition, design, construction, and asset management through dedicated in-house teams."
      heroImage="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
