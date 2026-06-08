import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "Long-Term Crude Oil Offtake Programme",
    description:
      "MainKey Limited holds long-term crude oil offtake agreements with refineries and sovereign energy buyers across Africa and the Middle East. These agreements underpin high-volume, dependable petroleum supply chains serving national energy programmes and private sector networks.",
    image: "/images/hero3.jpg",
    tags: ["Crude Oil", "Offtake"],
  },
  {
    title: "Petroleum Products Supply & Distribution",
    description:
      "MainKey Limited oversees the supply and distribution of PMS, AGO, and EN590 diesel to over 2,300 filling stations across MTC's operational territories. Our logistics infrastructure spans bulk terminals, truck fleets, and pipeline access — delivering consistent, competitive supply to end users.",
    image: "/images/hero4.jpg",
    tags: ["PMS", "Diesel"],
  },
  {
    title: "LNG & LPG International Trading",
    description:
      "MTC Group's trading desk executes LNG and LPG transactions sourced from major producing regions and delivered to off-grid power operators, industrial consumers, and gas distributors. Risk management, logistics, and contract fulfilment are handled in-house across complex multi-party transactions.",
    video: "/media/vid3.mp4",
    tags: ["LNG", "LPG"],
  },
  {
    title: "Aviation Fuel Supply — Jet A1",
    description:
      "MainKey Limited maintains an active Jet A1 aviation fuel supply programme serving airports and airline operators across Africa. Leveraging direct refinery relationships and terminal access, the company delivers certified aviation fuel on both spot and long-term contract terms.",
    image: "/images/hero2.jpg",
    tags: ["Jet A1", "Aviation"],
  },
];

const capabilities = [
  "Crude oil purchasing, trading, and offtake",
  "PMS, AGO, EN590 diesel supply and distribution",
  "LNG and LPG international trading",
  "Jet A1 aviation fuel supply",
  "Fertilizer and industrial chemical trading",
  "Refinery relationship management",
  "Energy risk management and hedging",
  "Bulk terminal access and storage agreements",
];

export default function Trading() {
  return (
    <SectorDetailLayout
      sectorName="Trading & Commodities"
      sectorSlug="trading"
      tagline="International energy and commodity trading through MainKey Limited — large-scale petroleum supply across global markets."
      overview="MTC Group's Trading & Commodities division, executed through MainKey Limited, is one of the group's highest-value business platforms. MainKey operates as an active energy trader and supply chain principal — sourcing crude oil and petroleum products from global refineries and distributing them to buyers across Africa, the Middle East, Europe, and Asia. The division commands an extensive network of refinery offtake agreements, terminal access, and logistics infrastructure. Products traded include crude oil, PMS, AGO, LNG, LPG, Jet A1, and fertilizers — serving national oil companies, commercial distributors, filling station networks, and industrial consumers."
      heroImage="/images/hero3.jpg"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
