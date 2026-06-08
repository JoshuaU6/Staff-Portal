import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "Industrial IoT & Asset Intelligence",
    description:
      "MTC Group deploys industrial IoT systems across its energy and infrastructure assets, enabling real-time monitoring, predictive maintenance, and operational efficiency. Our platform integrates with SCADA and control systems across energy facilities and pipeline environments.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=80",
    tags: ["IoT", "Smart Infrastructure"],
  },
  {
    title: "Tier-III Data Centre – West Africa",
    description:
      "MTC Group's Technology division develops and runs Tier-III data centre infrastructure serving cloud hosting, enterprise IT, and government digital services across West Africa. The facility provides co-location, managed services, and disaster recovery capacity.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&q=80",
    tags: ["Data Centre", "Digital Infrastructure"],
  },
  {
    title: "Digital Oilfield Management Systems",
    description:
      "MTC Group deploys digital oilfield management platforms for upstream and midstream operators across the MENA region. Solutions encompass remote sensing, production optimisation, HSE digital management, and integrated field operations dashboards.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1000&q=80",
    tags: ["Digital Oilfield", "Upstream"],
  },
  {
    title: "Fintech & Digital Payment Platform",
    description:
      "MTC Group holds strategic positions in fintech platforms enabling digital payments, mobile banking, and financial inclusion across sub-Saharan Africa. These operations drive digital commerce growth in high-potential emerging markets.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1000&q=80",
    tags: ["Fintech", "Digital Payments"],
  },
];

const capabilities = [
  "Industrial IoT and smart asset monitoring",
  "Data centre development and operations",
  "Digital oilfield technology deployment",
  "ERP and enterprise systems integration",
  "Fintech and digital payment infrastructure",
  "Cybersecurity for critical infrastructure",
  "AI and data analytics for asset management",
];

export default function Technology() {
  return (
    <SectorDetailLayout
      sectorName="Technology"
      sectorSlug="technology"
      tagline="Deploying digital infrastructure, industrial technology, and smart systems across MTC Group's energy, logistics, and commercial operations."
      overview="MTC Group's Technology division drives digital transformation across the group's energy, infrastructure, and commercial portfolio. From industrial IoT on energy assets to data centre development and fintech platforms, MTC builds and runs a portfolio of technology assets aligned with the region's digital economy. Our technology capability is applied directly across MTC Group operations — improving efficiency, safety, and performance in refinery, logistics, and infrastructure environments — and extended to third-party operators seeking scalable digital solutions."
      heroImage="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
