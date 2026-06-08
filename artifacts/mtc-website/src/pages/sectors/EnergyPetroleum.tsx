import { SectorDetailLayout, Project } from "@/components/SectorDetailLayout";

const projects: Project[] = [
  {
    title: "Crude Oil Trading & Refinery Offtake",
    description:
      "MainKey Limited executes large-scale crude oil trading and refinery offtake across the Middle East and West Africa. Transaction coverage spans sourcing, vessel scheduling, financing, and delivery to sovereign buyers, refineries, and commercial off-takers.",
    image: "/images/hero3.jpg",
    tags: ["Crude Oil", "Offtake"],
  },
  {
    title: "Strategic Tank Farm & Storage Network",
    description:
      "MTC Group maintains strategic petroleum storage infrastructure across port and inland terminals. Our tank farm network controls bulk inventory of crude oil and refined products, underpinning trading continuity, national supply programmes, and commercial distribution.",
    image: "/images/hero2.jpg",
    tags: ["Tank Farm", "Petroleum Storage"],
  },
  {
    title: "Refining & Downstream Processing",
    description:
      "MTC Group's refinery assets drive crude processing, product manufacturing, and downstream market supply at industrial scale. Facilities are configured for high-volume fuel production and reliable distribution across domestic and export markets.",
    image: "/images/hero1.jpg",
    tags: ["Refinery", "Downstream"],
  },
  {
    title: "MTC Gulf Bay Refinery – Flagship Asset",
    description:
      "MTC Gulf Bay Refinery is the Group's flagship petroleum processing asset, delivering refining throughput, product supply, and export-oriented distribution at scale. The facility anchors MTC's integrated downstream platform in the Americas.",
    image: "/images/hero4.jpg",
    tags: ["Refinery", "USA"],
  },
  {
    title: "Offshore Energy Infrastructure",
    description:
      "MTC Group maintains offshore energy infrastructure through fabrication-linked preparation, structural readiness, and coordinated project execution for petroleum and marine installations. This capability anchors the Group's offshore and downstream energy platform.",
    image: "/media/img4.jpg",
    tags: ["Offshore", "Energy Infrastructure"],
  },
  {
    title: "Subsea Loadout & Offshore Preparation",
    description:
      "MTC Group oversees subsea structure loadout and offshore preparation — coordinating mobilisation, logistics, and execution for marine energy assets. These capabilities are integral to our offshore energy platform.",
    image: "/media/img5.jpg",
    tags: ["Subsea", "Offshore"],
  },
  {
    title: "Field Workforce & Project Execution",
    description:
      "MTC Group's technical workforce drives energy and petroleum project delivery through disciplined site execution, rigorous safety compliance, and full operational readiness. Teams are deployed across key assets from mobilisation through commissioning.",
    image: "/media/img9.jpg",
    tags: ["Workforce", "Project Execution"],
  },
  {
    title: "Nationwide Fuel Distribution Network",
    description:
      "MTC Group controls a downstream fuel distribution network spanning supply, retail, and last-mile delivery across commercial and consumer markets. The platform ensures consistent product coverage and retail continuity at regional scale.",
    image: "/media/img1.jpg",
    tags: ["Fuel Distribution", "Downstream"],
  },
  {
    title: "Active Field & Site Operations",
    description:
      "MTC Group oversees petroleum site operations covering equipment mobilisation, active field coordination, and execution across its energy portfolio. These activities ensure productivity, safety compliance, and uninterrupted operational continuity.",
    video: "/media/vid1.mp4",
    tags: ["Petroleum", "Site Operations"],
  },
  {
    title: "Energy Project Commissioning",
    description:
      "MTC Group's project teams drive commissioning readiness and technical execution across active energy assets. Field progress reflects the Group's disciplined approach to performance management and on-schedule delivery.",
    video: "/media/vid2.mp4",
    tags: ["Energy", "Commissioning"],
  },
  {
    title: "Petroleum Processing & Product Supply",
    description:
      "MTC Group's downstream platform controls petroleum processing, product distribution, and supply chain coordination across key markets. Operations are configured for processing continuity and efficient delivery of refined petroleum products.",
    video: "/media/vid3.mp4",
    tags: ["Petroleum Processing", "Downstream"],
  },
  {
    title: "Offshore Production & Marine Operations",
    description:
      "MTC Group oversees offshore petroleum activities including FPSO-linked operations, marine energy systems, and offshore production management. Our offshore platform coordinates marine logistics, process infrastructure, and field operations across key energy environments.",
    video: "/media/vid4.mp4",
    tags: ["Offshore", "FPSO"],
  },
  {
    title: "Strategic Storage & Marine Logistics",
    description:
      "MTC Group maintains an integrated petroleum storage and marine logistics platform, controlling bulk inventory, vessel-linked movements, and coordinated transfer of crude and refined products at volume and speed.",
    video: "/media/vid5.mp4",
    tags: ["Storage", "Marine Logistics"],
  },
  {
    title: "Downstream Processing & Energy Supply",
    description:
      "MTC Group's downstream facilities maintain petroleum processing capacity, storage integration, and supply infrastructure across all target markets. Operations deliver production continuity and market reliability at scale.",
    video: "/media/vid6.mp4",
    tags: ["Processing", "Downstream Energy"],
  },
];

const capabilities = [
  "Crude oil trading and international offtake",
  "Petroleum product supply — PMS, AGO, LNG, LPG, Jet A1",
  "Refinery operations and downstream processing",
  "Tank farm development and strategic storage",
  "Offshore energy infrastructure and project execution",
  "Nationwide fuel distribution and retail networks",
  "Global energy logistics and marine operations",
  "Integrated upstream, midstream and downstream platform",
];

export default function EnergyPetroleum() {
  return (
    <SectorDetailLayout
      sectorName="Energy & Petroleum"
      sectorSlug="energy-petroleum"
      tagline="Crude oil trading, petroleum supply, refinery operations, tank farm storage, fuel distribution, and global energy logistics."
      overview="MTC Group's Energy & Petroleum division commands an integrated platform spanning crude oil trading, petroleum product supply, refinery operations, tank farm storage, fuel distribution, and global energy logistics. Through MainKey Limited and strategic operating assets, the Group maintains upstream, midstream, and downstream capability serving international energy markets at scale."
      heroImage="/images/hero1.jpg"
      projects={projects}
      capabilities={capabilities}
    />
  );
}
