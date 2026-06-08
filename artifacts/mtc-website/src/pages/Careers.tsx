import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MapPin, Briefcase, Clock, ChevronRight, Users, Globe, TrendingUp, Star } from "lucide-react";
import { Link } from "wouter";

const OPEN_ROLES = [
  {
    title: "Senior Crude Oil Trader",
    department: "Energy & Trading",
    location: "London, UK",
    type: "Full-time",
    level: "Senior",
  },
  {
    title: "Tank Farm Operations Manager",
    department: "Energy & Petroleum",
    location: "Lagos, Nigeria",
    type: "Full-time",
    level: "Management",
  },
  {
    title: "International Commodity Analyst",
    department: "Trading & Commodities",
    location: "Washington D.C., USA",
    type: "Full-time",
    level: "Mid-level",
  },
  {
    title: "Agricultural Supply Chain Manager",
    department: "Agriculture & Consumer Goods",
    location: "Lagos, Nigeria",
    type: "Full-time",
    level: "Management",
  },
  {
    title: "Corporate Finance Associate",
    department: "Finance",
    location: "Washington D.C., USA",
    type: "Full-time",
    level: "Mid-level",
  },
  {
    title: "Real Estate Development Lead",
    department: "Real Estate",
    location: "Dubai, UAE",
    type: "Full-time",
    level: "Senior",
  },
  {
    title: "HSE & Compliance Officer",
    department: "Operations",
    location: "Lagos, Nigeria",
    type: "Full-time",
    level: "Mid-level",
  },
  {
    title: "IT Infrastructure Engineer",
    department: "Technology",
    location: "Remote / Washington D.C.",
    type: "Full-time",
    level: "Mid-level",
  },
];

const VALUES = [
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Work across 20+ countries and build a career that spans continents.",
  },
  {
    icon: TrendingUp,
    title: "Growth & Advancement",
    desc: "Fast-moving organisation with real promotion paths and visible leadership.",
  },
  {
    icon: Users,
    title: "Diverse Teams",
    desc: "A multinational workforce bringing together the best talent from around the world.",
  },
  {
    icon: Star,
    title: "Meaningful Work",
    desc: "Contribute to energy infrastructure, trade, and development that impacts millions.",
  },
];

const LEVEL_COLOURS: Record<string, string> = {
  Senior: "bg-mtc-charcoal text-white",
  Management: "bg-mtc-red text-white",
  "Mid-level": "bg-mtc-grey text-mtc-charcoal",
};

export default function Careers() {
  return (
    <Layout>
      <div
        className="relative pt-48 pb-32 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero4.jpg)" }}
      >
        <div className="absolute inset-0 bg-mtc-charcoal/85" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Join Our Team</span>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">
              Build Your Career<br />at MTC Group
            </h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto font-light">
              Shape the future of global energy, trade, and infrastructure. Join a team of professionals operating across four continents.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 80}>
                <div className="text-center p-8 bg-mtc-grey border-b-4 border-transparent hover:border-mtc-red transition-all">
                  <div className="w-14 h-14 bg-mtc-red rounded-full flex items-center justify-center text-white mx-auto mb-5">
                    <v.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-mtc-charcoal mb-3">{v.title}</h3>
                  <p className="text-gray-600 text-sm font-light leading-relaxed">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mb-14">
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-3 block">Opportunities</span>
            <h2 className="text-4xl font-serif font-bold text-mtc-charcoal mb-3">Open Positions</h2>
            <div className="h-1 w-20 bg-mtc-red" />
          </ScrollReveal>

          <div className="space-y-4">
            {OPEN_ROLES.map((role, i) => (
              <ScrollReveal key={role.title} delay={i * 50}>
                <div className="bg-white p-7 shadow-sm hover:shadow-lg transition-shadow group border-l-4 border-transparent hover:border-mtc-red">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-xs px-3 py-1 font-bold uppercase tracking-wide rounded-full ${LEVEL_COLOURS[role.level]}`}>
                          {role.level}
                        </span>
                        <span className="text-xs text-mtc-red font-semibold uppercase tracking-widest">{role.department}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-mtc-charcoal group-hover:text-mtc-red transition-colors">
                        {role.title}
                      </h3>
                      <div className="flex items-center gap-6 mt-2 text-gray-500 text-sm flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-mtc-red" /> {role.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-mtc-red" /> {role.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-mtc-red" /> {role.department}
                        </span>
                      </div>
                    </div>
                    <Link href="/contact">
                      <button className="bg-mtc-red text-white px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:bg-red-800 transition-colors flex items-center gap-2 whitespace-nowrap">
                        Apply Now <ChevronRight className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-mtc-charcoal text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif text-white font-bold mb-5">
            Don't See Your Role?
          </h2>
          <p className="text-white/70 font-light mb-8 text-lg">
            MTC Group is always looking for exceptional talent. Send us your CV and we'll keep you in mind for future opportunities.
          </p>
          <Link href="/contact">
            <button className="bg-mtc-red text-white font-bold px-10 py-4 uppercase tracking-wide hover:bg-red-800 transition-colors">
              Send Speculative Application
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
