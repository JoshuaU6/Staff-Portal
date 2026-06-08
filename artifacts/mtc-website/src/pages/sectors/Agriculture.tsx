import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "Grain & Commodity Import Programme",
    description:
      "MTC Group, through Safwad Limited, executes large-scale importation of wheat, rice, maize, and edible oils from South America, Eastern Europe, and Southeast Asia. Our supply chain connects international grain markets with West African distributors and government food security programmes.",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000&q=80",
    tags: ["Grains", "Food Commodities"],
  },
  {
    title: "Consumer Goods Distribution Network",
    description:
      "Safwad Limited controls the distribution of fast-moving consumer goods — including baby care, sanitary, and feminine hygiene products — across West African markets. Our network reaches wholesalers, retailers, and institutional buyers, ensuring essential products reach communities at scale.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=80",
    tags: ["FMCG", "Distribution"],
  },
  {
    title: "Agricultural Export Programme",
    description:
      "Safwad Limited oversees the export of cash crops and agricultural produce to international markets, handling logistics, quality certification, compliance documentation, and buyer relationships. Our export programme creates a reliable, certified international trade pipeline.",
    image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=1000&q=80",
    tags: ["Export", "Cash Crops"],
  },
  {
    title: "Sanitary & Hygiene Products Supply Chain",
    description:
      "Safwad Limited runs an integrated supply chain for sanitary and hygiene products — from bulk sourcing and importation through to last-mile retail distribution. The network serves hospitals, NGOs, retail chains, and end consumers across multiple African countries.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&q=80",
    tags: ["Sanitary", "Hygiene"],
  },
];

const capabilities = [
  "Agricultural commodity import and export",
  "Grain, edible oil, and food commodity trading",
  "Consumer goods and FMCG distribution",
  "Sanitary and hygiene product supply chains",
  "International logistics and supply chain management",
  "Wholesale and retail distribution networks",
  "Quality certification and compliance management",
];

export default function Agriculture() {
  return (
    <SectorDetailLayout
      sectorName="Agriculture & Consumer Goods"
      sectorSlug="agriculture"
      tagline="Global import, export, and distribution of agricultural commodities and essential consumer goods through Safwad Limited."
      overview="MTC Group's Agriculture & Consumer Goods division, executed through Safwad Limited, controls the movement of essential commodities between global producers and regional markets. Safwad runs importation programmes for grains, edible oils, pulses, and sugar, alongside distribution networks for fast-moving consumer goods including baby care and hygiene products. The division maintains warehousing, logistics, and distribution relationships across Africa — serving governments, institutional buyers, retail chains, and wholesale distributors."
      heroImage="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
