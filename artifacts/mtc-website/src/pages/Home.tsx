import { Layout } from "@/components/layout/Layout";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { StatCounter } from "@/components/StatCounter";
import { GlobalClock } from "@/components/GlobalClock";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Flame, Warehouse, Building2, ChevronRight, TrendingUp, Wheat } from "lucide-react";

const STATS = [
  { label: "Countries", value: "20+" },
  { label: "Employees Worldwide", value: "10,000+" },
  { label: "Filling Stations", value: "2,300+" },
  { label: "Projects Delivered", value: "1,000+" },
];

const SECTOR_PREVIEWS = [
  {
    title: "Energy & Petroleum",
    desc: "Crude oil trading, petroleum supply chains, refinery operations, tank farms, and fuel distribution across global markets.",
    icon: Flame,
    href: "/sectors/energy-petroleum",
    label: "Our Core Business",
  },
  {
    title: "Trading & Commodities",
    desc: "International energy and commodity trading through MainKey Limited — connecting global buyers and sellers across oil, gas, and industrial products.",
    icon: TrendingUp,
    href: "/sectors/trading",
    label: "MainKey Limited",
  },
  {
    title: "Agriculture & Consumer Goods",
    desc: "Import, export, and distribution of agricultural commodities, consumer goods, and sanitary products through Safwad Limited.",
    icon: Wheat,
    href: "/sectors/agriculture",
    label: "Safwad Limited",
  },
  {
    title: "Infrastructure & Real Estate",
    desc: "Large-scale infrastructure development, industrial facilities, commercial and residential real estate across Africa and beyond.",
    icon: Warehouse,
    href: "/sectors/infrastructure",
    label: "Development Division",
  },
];

export default function Home() {
  return (
    <Layout>
      <HeroCarousel />

      {/* Global Clocks Strip */}
      <section className="bg-mtc-charcoal py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlobalClock compact />
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-white border-b border-gray-100 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-12 divide-y md:divide-y-0 md:divide-x divide-gray-200">
            {STATS.map((stat) => (
              <StatCounter key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
        <div className="w-full h-1 bg-mtc-red" />
      </section>

      {/* Company Overview */}
      <section className="py-24 bg-white" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <ScrollReveal className="lg:w-[60%]">
              <div className="mb-8">
                <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">About MTC Group</span>
                <h2 className="text-4xl md:text-5xl font-serif text-mtc-charcoal font-bold leading-tight">
                  A Global Energy &amp; Investment Group
                </h2>
              </div>
              <div className="space-y-6 text-mtc-charcoal text-lg leading-relaxed font-light">
                <p>
                  MTC Group of Companies is a global investment and industrial group operating across Africa, the Middle East, Europe, and Asia. Our principal operations span oil and gas trading, refinery development, tank farm infrastructure, filling station networks, and energy logistics.
                </p>
                <p>
                  Through our subsidiaries — MainKey Limited and Safwad Limited — we execute international energy transactions, agricultural commodity trade, and consumer goods distribution at scale. Our model mirrors the world's leading integrated energy groups: diversified, vertically structured, and globally connected.
                </p>
                <p>
                  With a presence in over 20 countries, more than 10,000 employees worldwide, and a network of 2,300+ filling stations, MTC Group is positioned as a significant force in global energy and international trade.
                </p>
                <Link href="/about" className="inline-block mt-6">
                  <Button variant="outline" className="border-mtc-charcoal text-mtc-charcoal hover:bg-mtc-charcoal hover:text-white rounded-none px-8 py-6">
                    Our Story
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal className="lg:w-[40%] w-full" delay={150}>
              <div className="bg-mtc-red text-white p-10 shadow-2xl h-full flex flex-col justify-center">
                <ul className="space-y-8 text-lg">
                  <li className="flex flex-col border-b border-white/20 pb-4">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Headquarters</span>
                    <span className="font-semibold">Washington, D.C., USA</span>
                  </li>
                  <li className="flex flex-col border-b border-white/20 pb-4">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Global Operations</span>
                    <span className="font-semibold">Africa | Middle East | Europe | Asia</span>
                  </li>
                  <li className="flex flex-col border-b border-white/20 pb-4">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Core Sectors</span>
                    <span className="font-semibold">8 high-impact industries</span>
                  </li>
                  <li className="flex flex-col border-b border-white/20 pb-4">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Subsidiaries</span>
                    <span className="font-semibold">MainKey Limited · Safwad Limited</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Contact</span>
                    <span className="font-semibold">contact@mtc-groups.com</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Core Sectors Preview */}
      <section className="py-24 bg-mtc-grey" id="sectors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-3 block">What We Do</span>
                <h2 className="text-4xl md:text-5xl font-serif text-mtc-charcoal font-bold mb-4">Our Core Business Areas</h2>
                <div className="w-20 h-1 bg-mtc-red" />
              </div>
              <Link href="/sectors" className="hidden md:flex items-center text-mtc-red font-semibold hover:text-red-800 transition-colors mt-4 md:mt-0">
                View All 8 Sectors <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SECTOR_PREVIEWS.map((sector, i) => (
              <ScrollReveal key={sector.title} delay={i * 100}>
                <Link href={sector.href} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-mtc-red" aria-label={`Explore ${sector.title}`}>
                  <div className="sector-card relative group bg-white shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-mtc-red h-full overflow-hidden p-8">
                    <span className="text-xs font-bold text-mtc-red uppercase tracking-widest mb-4 block">{sector.label}</span>
                    <div className="w-14 h-14 bg-mtc-charcoal rounded-full flex items-center justify-center text-white mb-6 group-hover:bg-mtc-red transition-colors duration-300">
                      <sector.icon className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-mtc-charcoal mb-3 leading-snug">{sector.title}</h3>
                    <p className="text-gray-500 font-light leading-relaxed text-sm">{sector.desc}</p>
                    <div
                      className="sector-hover-overlay absolute inset-0 bg-mtc-red flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 p-6"
                      aria-hidden="true"
                    >
                      <sector.icon className="w-10 h-10 text-white mb-3 opacity-80" />
                      <span className="text-white text-lg font-bold tracking-wide text-center">{sector.title}</span>
                      <span className="text-white/70 text-sm mt-2">Explore →</span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link href="/sectors" className="inline-flex items-center text-mtc-red font-semibold">
              View All 8 Sectors <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Energy Focus Strip */}
      <section className="py-20 bg-mtc-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-3 block">Energy & Petroleum — Our Primary Business</span>
              <h2 className="text-3xl md:text-4xl font-serif text-white font-bold">End-to-End Energy Operations</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Crude Oil Trading" },
              { label: "Petroleum Supply" },
              { label: "Refinery Operations" },
              { label: "Tank Farm Storage" },
              { label: "Fuel Distribution" },
              { label: "Energy Logistics" },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 60}>
                <div className="border border-white/10 p-6 text-center hover:border-mtc-red hover:bg-white/5 transition-all duration-300">
                  <div className="w-2 h-2 bg-mtc-red rounded-full mx-auto mb-4" />
                  <p className="text-white font-semibold text-sm leading-snug">{item.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/sectors/energy-petroleum">
              <Button className="bg-mtc-red hover:bg-red-800 text-white rounded-none px-10 py-5 text-base tracking-wide uppercase">
                Explore Energy &amp; Petroleum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Chairman Message Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-shrink-0">
                <div className="w-44 h-56 overflow-hidden shadow-2xl border-l-4 border-mtc-gold">
                  <img
                    src="/images/abba-photo.jpg"
                    alt="A.S. Abba — Chairman, MTC Group of Companies"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-grow">
                <span className="text-mtc-gold font-bold tracking-widest text-sm uppercase mb-4 block">Chairman's Message</span>
                <blockquote className="text-2xl md:text-3xl font-serif text-mtc-charcoal font-light leading-relaxed italic mb-6">
                  "MTC Group is committed to building a global platform connecting energy, infrastructure, and international trade across strategic markets."
                </blockquote>
                <p className="text-gray-600 font-light mb-6">
                  At MTC Group, our vision is to build a world-class enterprise that delivers excellence through oil and gas trading, refinery development, infrastructure projects, and global investment across Africa, the Middle East, Europe, and Asia.
                </p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-mtc-charcoal">A.S. Abba</p>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">Chairman, MTC Group of Companies</p>
                  </div>
                  <Link href="/chairman" className="ml-auto">
                    <Button variant="outline" className="border-mtc-charcoal text-mtc-charcoal hover:bg-mtc-charcoal hover:text-white rounded-none px-6">
                      Full Message
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Subsidiaries Preview */}
      <section className="py-20 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-14">
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-3 block">Our Subsidiaries</span>
              <h2 className="text-3xl md:text-4xl font-serif text-mtc-charcoal font-bold">Executing Our Global Strategy</h2>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ScrollReveal>
              <div className="bg-white p-10 shadow-sm border-l-4 border-mtc-red h-full">
                <img src="/images/mainkey-logo.jpg" alt="MainKey Limited" className="h-12 mb-6 object-contain" />
                <h3 className="text-2xl font-serif font-bold text-mtc-charcoal mb-3">MainKey Limited</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-6">
                  Our energy and commodity trading arm. MainKey Limited handles international oil and gas transactions, petroleum product supply, and energy logistics across global markets.
                </p>
                <Link href="/subsidiaries">
                  <span className="text-mtc-red font-semibold text-sm uppercase tracking-wider hover:underline">Learn More →</span>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <div className="bg-white p-10 shadow-sm border-l-4 border-mtc-red h-full">
                <img src="/images/safwad-logo.jpg" alt="Safwad Limited" className="h-12 mb-6 object-contain" />
                <h3 className="text-2xl font-serif font-bold text-mtc-charcoal mb-3">Safwad Limited</h3>
                <p className="text-gray-600 font-light leading-relaxed mb-6">
                  Our international trade and consumer goods division. Safwad Limited manages import and export of agricultural commodities, diapers, sanitary products, and fast-moving consumer goods globally.
                </p>
                <Link href="/subsidiaries">
                  <span className="text-mtc-red font-semibold text-sm uppercase tracking-wider hover:underline">Learn More →</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* News & Insights Strip */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-end mb-14">
              <div>
                <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-3 block">Media & Press</span>
                <h2 className="text-4xl md:text-5xl font-serif text-mtc-charcoal font-bold mb-4">Latest News &amp; Insights</h2>
                <div className="w-20 h-1 bg-mtc-red" />
              </div>
              <Link href="/news" className="hidden md:flex items-center text-mtc-red font-semibold hover:text-red-800 transition-colors mt-4 md:mt-0">
                All News &amp; Press <ChevronRight className="w-5 h-5 ml-1" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                date: "March 12, 2026",
                category: "Energy",
                title: "MTC Group Expands Crude Oil Offtake Portfolio Across West Africa",
                excerpt: "New long-term offtake agreements reinforce MTC Group's position as a major petroleum supply chain operator.",
                image: "/images/hero3.jpg",
              },
              {
                date: "February 28, 2026",
                category: "Infrastructure",
                title: "Gulf Bay Refinery — Phase II Development Update",
                excerpt: "Phase I commissioning complete; Phase II expands throughput capacity for domestic and export production.",
                image: "/images/hero4.jpg",
              },
              {
                date: "January 30, 2026",
                category: "Sustainability",
                title: "MTC Group Publishes Inaugural ESG Framework",
                excerpt: "Our first ESG report outlines environmental, social, and governance commitments across all territories.",
                image: "/images/hero1.jpg",
              },
            ].map((article, i) => (
              <ScrollReveal key={article.title} delay={i * 100}>
                <Link href="/news" className="block group">
                  <div className="overflow-hidden mb-4">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <span className="text-xs font-bold text-mtc-red uppercase tracking-widest">{article.category}</span>
                  <span className="text-xs text-gray-400 ml-3">{article.date}</span>
                  <h3 className="text-lg font-serif font-bold text-mtc-charcoal mt-2 mb-2 leading-snug group-hover:text-mtc-red transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">{article.excerpt}</p>
                  <span className="text-mtc-red text-sm font-semibold mt-3 flex items-center">
                    Read More <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-mtc-charcoal diagonal-pattern relative">
        <ScrollReveal className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif text-white font-bold mb-6">Let's Work Together</h2>
          <p className="text-xl text-gray-400 mb-10 font-light max-w-2xl mx-auto">
            Explore partnership and investment opportunities with a global energy and investment group operating across four continents.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/sectors">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-mtc-charcoal hover:bg-gray-100 rounded-none px-10 py-6 text-lg font-semibold"
              >
                Explore Our Business
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white hover:text-mtc-charcoal rounded-none px-10 py-6 text-lg"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </Layout>
  );
}
