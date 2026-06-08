import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Leaf, Users, ShieldCheck, Globe, Sun, Recycle, Heart, GraduationCap } from "lucide-react";
import { Link } from "wouter";

const PILLARS = [
  {
    icon: Sun,
    title: "Clean Energy Operations",
    desc: "MTC Group's sustainability approach begins at the refinery and field level. We implement energy-efficient processes, emissions monitoring, and responsible petroleum operations across all our energy assets to reduce environmental impact.",
  },
  {
    icon: Globe,
    title: "Environmental Responsibility",
    desc: "Our refinery, petroleum, and infrastructure operations adhere to internationally recognised environmental standards. We monitor emissions, manage waste responsibly, and operate facilities designed to meet global environmental compliance requirements.",
  },
  {
    icon: Users,
    title: "Community Development",
    desc: "MTC Group develops and manages educational institutions, healthcare facilities, and economic infrastructure across communities surrounding its energy operations — across Africa, the Middle East, and other operational territories.",
  },
  {
    icon: ShieldCheck,
    title: "Corporate Governance",
    desc: "MTC Group maintains rigorous corporate governance standards across all subsidiaries, including transparent financial reporting, anti-corruption policies, and independent board oversight aligned with international best practice.",
  },
  {
    icon: Heart,
    title: "Health, Safety & HSE",
    desc: "The safety of our employees, contractors, and communities across all refinery, energy, and infrastructure sites is non-negotiable. We maintain a zero major safety incident policy and operate to international HSE standards across all operations.",
  },
  {
    icon: GraduationCap,
    title: "Education & Workforce Development",
    desc: "Through its Education division and corporate programmes, MTC Group operates skills development, vocational training, and workforce capability programmes directly aligned with our global energy and infrastructure operations.",
  },
];

const COMMITMENTS = [
  { value: "10,000+", label: "Workforce" },
  { value: "Multi-Country", label: "Compliance" },
  { value: "Zero", label: "Major Safety Incident Policy" },
  { value: "50+", label: "Community Projects" },
];

export default function Sustainability() {
  return (
    <Layout>
      <div
        className="relative pt-48 pb-32 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero1.jpg)" }}
      >
        <div className="absolute inset-0 bg-mtc-charcoal/85" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Leaf className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-bold tracking-widest text-sm uppercase">ESG & Sustainability</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">
              Delivering Sustainable Energy<br />at Industrial Scale
            </h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto font-light">
              MTC Group integrates sustainability across refinery operations, petroleum infrastructure, and global energy projects.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <ScrollReveal className="lg:w-[55%]">
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Our Approach</span>
              <h2 className="text-4xl font-serif font-bold text-mtc-charcoal mb-8 leading-tight">
                Sustainability at the Core of Our Business
              </h2>
              <div className="space-y-5 text-gray-600 text-lg font-light leading-relaxed">
                <p>
                  Sustainability is embedded across every layer of MTC Group's operations — from refinery and petroleum infrastructure to civil construction, healthcare, and education.
                </p>
                <p>
                  Our ESG framework aligns with internationally recognised standards including the UN Global Compact and the UN Sustainable Development Goals. We measure and report social, environmental, and governance performance as part of our commitment to full accountability.
                </p>
                <p>
                  MTC Group's operations reach communities across Africa, the Middle East, Europe, and Asia. We hold that responsibility fully — and execute against it.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="lg:w-[45%] w-full" delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {COMMITMENTS.map((c) => (
                  <div key={c.label} className="bg-mtc-grey p-8 text-center border-b-4 border-mtc-red">
                    <div className="text-3xl md:text-4xl font-serif font-bold text-mtc-red mb-2">{c.value}</div>
                    <p className="text-mtc-charcoal text-sm font-semibold leading-snug">{c.label}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">ESG Pillars</span>
            <h2 className="text-4xl font-serif font-bold text-mtc-charcoal mb-4">Our Six Pillars of Responsibility</h2>
            <div className="h-1 w-20 bg-mtc-red mx-auto" />
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PILLARS.map((p, i) => (
              <ScrollReveal key={p.title} delay={i * 80}>
                <div className="bg-white p-10 shadow-sm hover:shadow-xl hover:border-t-4 hover:border-mtc-red transition-all duration-300 h-full">
                  <div className="w-16 h-16 bg-mtc-red rounded-full flex items-center justify-center text-white mb-6">
                    <p.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-mtc-charcoal mb-4">{p.title}</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{p.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <ScrollReveal className="lg:w-[50%]">
              <img
                src="/images/hero2.jpg"
                alt="MTC Group energy operations"
                className="w-full h-80 object-cover shadow-2xl"
              />
            </ScrollReveal>
            <ScrollReveal className="lg:w-[50%]" delay={150}>
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Energy Development</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-mtc-charcoal mb-6 leading-tight">
                Delivering Global Energy Supply Responsibly
              </h2>
              <div className="space-y-4 text-gray-600 font-light leading-relaxed">
                <p>
                  MTC Group delivers global energy supply through refinery operations, petroleum infrastructure, and integrated logistics — with full environmental compliance across every operating environment.
                </p>
                <p>
                  MTC Group also develops and operates educational institutions and healthcare facilities across the communities where we work — because the long-term strength of our business and the development of the communities around it are inseparable.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Recycle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-semibold">Aligned with UN Sustainable Development Goals</span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="bg-mtc-charcoal py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-serif text-white font-bold mb-4">Read Our ESG Report</h2>
          <p className="text-white/70 font-light mb-8">
            Download MTC Group's inaugural ESG Framework and Sustainability Report — outlining our commitments, progress, and targets across all pillars.
          </p>
          <Link href="/contact">
            <button className="bg-mtc-red text-white font-bold px-10 py-4 uppercase tracking-wide hover:bg-red-800 transition-colors mr-4">
              Request Report
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
