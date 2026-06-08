import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Handshake, Flame, TrendingUp, Warehouse, Globe, ChevronRight, Mail } from "lucide-react";

const COLLABORATION_AREAS = [
  {
    icon: Flame,
    title: "Oil & Gas Licensing & Asset Development",
    desc: "MTC Group engages in oil and gas licensing rounds, upstream asset development, and field participation across Africa and the Middle East.",
  },
  {
    icon: TrendingUp,
    title: "International Crude Oil Trading",
    desc: "Our trading desk executes large-scale crude oil transactions with refineries, sovereign buyers, and commodity trading firms across global markets.",
  },
  {
    icon: Globe,
    title: "Petroleum Storage & Distribution",
    desc: "MTC Group operates tank farm infrastructure and fuel distribution networks — creating access points for petroleum storage and last-mile supply collaborations.",
  },
  {
    icon: Warehouse,
    title: "Infrastructure & Industrial Projects",
    desc: "Through our civil engineering and real estate divisions, MTC Group executes large-scale infrastructure developments, industrial facilities, and urban development programmes.",
  },
];

const PARTNER_TYPES = [
  "Energy Companies",
  "Trading Firms",
  "Infrastructure Developers",
  "Government Institutions",
];

export default function Partnerships() {
  return (
    <Layout>
      {/* Hero */}
      <div
        className="relative pt-48 pb-36 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero3.jpg)" }}
      >
        <div className="absolute inset-0 bg-mtc-charcoal/88" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Handshake className="w-6 h-6 text-mtc-red" />
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase">MTC Group</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6 leading-tight">
              Strategic Partnerships<br />&amp; Joint Ventures
            </h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto font-light">
              Engaging the world's leading energy companies, trading firms, infrastructure developers, and government institutions across global markets.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <ScrollReveal className="lg:w-[60%]">
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Our Approach</span>
              <h2 className="text-4xl font-serif font-bold text-mtc-charcoal mb-8 leading-tight">
                Built for Large-Scale Collaboration
              </h2>
              <div className="space-y-5 text-gray-600 text-lg font-light leading-relaxed">
                <p>
                  At MTC Group of Companies, we actively engage in strategic partnerships and joint ventures across energy, infrastructure, and international trade.
                </p>
                <p>
                  Our partnership model is designed to collaborate with energy companies, trading firms, infrastructure developers, and government institutions — delivering large-scale projects, petroleum trading operations, and industrial developments across multiple regions.
                </p>
                <p>
                  Every engagement is structured for long-term value, operational excellence, and shared growth — executed with the precision and discipline that defines MTC Group's approach to global business.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal className="lg:w-[40%]" delay={150}>
              <div className="bg-mtc-charcoal text-white p-10 shadow-2xl">
                <h3 className="text-lg font-bold uppercase tracking-wide mb-6 text-mtc-gold font-serif">We Collaborate With</h3>
                <ul className="space-y-4">
                  {PARTNER_TYPES.map((type) => (
                    <li key={type} className="flex items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                      <div className="w-2 h-2 bg-mtc-red rounded-full flex-shrink-0" />
                      <span className="text-white/80 font-light text-lg">{type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Collaboration Areas */}
      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Engagement Areas</span>
            <h2 className="text-4xl font-serif font-bold text-mtc-charcoal mb-4">Current Areas of Collaboration</h2>
            <div className="h-1 w-20 bg-mtc-red mx-auto" />
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {COLLABORATION_AREAS.map((area, i) => (
              <ScrollReveal key={area.title} delay={i * 80}>
                <div className="bg-white p-10 shadow-sm hover:shadow-xl hover:border-l-4 hover:border-mtc-red transition-all duration-300 h-full group">
                  <div className="w-16 h-16 bg-mtc-charcoal rounded-full flex items-center justify-center text-white mb-6 group-hover:bg-mtc-red transition-colors duration-300">
                    <area.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-mtc-charcoal mb-4 leading-snug">{area.title}</h3>
                  <div className="h-0.5 w-10 bg-mtc-red mb-4" />
                  <p className="text-gray-600 font-light leading-relaxed">{area.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-mtc-charcoal">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal>
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Get in Touch</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-6">
              Ready to Engage?
            </h2>
            <p className="text-white/70 mb-10 text-lg font-light max-w-2xl mx-auto">
              To explore a joint venture, licensing opportunity, or commercial engagement with MTC Group, contact our Partnerships team directly.
            </p>

            <div className="inline-flex flex-col sm:flex-row items-center gap-4 mb-10">
              <a
                href="mailto:partnerships@mtc-groups.com"
                className="flex items-center gap-3 bg-mtc-red text-white px-10 py-4 text-base font-semibold hover:bg-red-800 transition-colors uppercase tracking-wide"
              >
                <Mail className="w-5 h-5" />
                Partner With Us
              </a>
              <a
                href="mailto:partnerships@mtc-groups.com"
                className="text-white/60 hover:text-white transition-colors text-sm font-mono tracking-tight"
              >
                partnerships@mtc-groups.com
              </a>
            </div>

            <div className="border-t border-white/10 pt-10">
              <p className="text-white/40 text-sm font-light">
                For general inquiries: <a href="mailto:contact@mtc-groups.com" className="text-white/60 hover:text-white transition-colors">contact@mtc-groups.com</a>
                &nbsp; · &nbsp;
                For trading desk: <a href="mailto:trading@mtc-groups.com" className="text-white/60 hover:text-white transition-colors">trading@mtc-groups.com</a>
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </Layout>
  );
}
