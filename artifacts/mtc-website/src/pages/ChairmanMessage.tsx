import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ScrollReveal } from "@/components/ScrollReveal";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Quote, ChevronRight } from "lucide-react";

const FULL_MESSAGE = [
  "On behalf of the Board of Directors and the entire leadership of MTC Group of Companies, I extend a warm welcome to our investors, partners, clients, and all those who have accompanied us on this remarkable journey.",
  "MTC Group was founded on a singular conviction: that Africa and the broader developing world possess immense, largely untapped potential in energy, infrastructure, and international trade. We set out to build an enterprise that would not simply participate in these sectors, but actively shape their trajectory — connecting global capital and expertise with the opportunities that matter most.",
  "Today, we operate across more than 20 countries, spanning Africa, the Middle East, Europe, and Asia. Our core operations in crude oil trading, petroleum supply chains, refinery development, tank farm infrastructure, and fuel distribution form the backbone of a vertically integrated energy group. Through MainKey Limited, our commodity trading arm, and Safwad Limited, our international trade and consumer goods division, we deliver diversified value across every market we enter.",
  "What sets MTC Group apart is our long-term orientation. We do not pursue short-cycle gains at the expense of enduring relationships. Every partnership we form, every infrastructure project we commit to, and every supply chain we build is designed to generate lasting value — for our shareholders, our host communities, and the nations in which we operate.",
  "Our sustainability agenda is equally central to our strategy. As a significant actor in the global energy sector, we recognise both our responsibility and our opportunity to advance the transition toward more responsible, efficient, and environmentally considered operations. We are committed to transparency, governance excellence, and community development as foundational pillars of how we do business.",
  "Looking ahead, the opportunity before us is extraordinary. Global energy demand continues to grow, infrastructure deficits across Africa and Asia remain substantial, and the appetite for responsible, experienced investment partners is stronger than ever. MTC Group is uniquely positioned to serve as that partner.",
  "I thank every member of our team, our clients, and our investors for their trust and their continued commitment to our shared vision. The best chapters of the MTC Group story are yet to be written.",
];

export default function ChairmanMessage() {
  const [portraitError, setPortraitError] = useState(false);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-mtc-charcoal pt-40 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-mtc-gold font-bold tracking-widest text-sm uppercase mb-4 block">
              Leadership
            </span>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">
              Chairman's Message
            </h1>
            <div className="h-1 w-24 bg-mtc-red mb-0" />
          </motion.div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-mtc-grey border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-mtc-red transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/leadership" className="hover:text-mtc-red transition-colors">Leadership</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-mtc-charcoal font-medium">Chairman's Message</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">

            {/* Left: Message Body */}
            <div className="lg:col-span-2">
              <ScrollReveal>
                {/* Pull quote */}
                <div className="relative pl-8 border-l-4 border-mtc-red mb-12">
                  <Quote className="absolute -left-1 -top-1 w-6 h-6 text-mtc-red opacity-60" aria-hidden="true" />
                  <blockquote className="text-2xl md:text-3xl font-serif text-mtc-charcoal font-light leading-relaxed italic">
                    "MTC Group is committed to building a global platform connecting energy, infrastructure, and international trade — delivering lasting value across the markets that matter most."
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-[2px] bg-mtc-gold" />
                    <span className="text-sm text-gray-500 uppercase tracking-wider font-medium">A.S. Abba, Chairman</span>
                  </div>
                </div>
              </ScrollReveal>

              <div className="space-y-6 text-mtc-charcoal text-lg leading-relaxed font-serif font-light">
                {FULL_MESSAGE.map((para, i) => (
                  <ScrollReveal key={i} delay={i * 60}>
                    <p>{para}</p>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal delay={200}>
                <div className="mt-12 pt-10 border-t border-gray-200 flex items-center gap-6">
                  <div className="w-14 h-[3px] bg-mtc-gold" />
                  <div>
                    <p className="text-xl font-serif font-bold text-mtc-charcoal">A.S. Abba</p>
                    <p className="text-sm text-gray-500 uppercase tracking-widest mt-1">
                      Chairman &amp; Group Chief Executive<br />MTC Group of Companies
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Executive Bio Card */}
            <div className="lg:col-span-1">
              <ScrollReveal delay={100}>
                <div className="sticky top-32">
                  {/* Portrait */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-mtc-red/10 to-transparent z-0" />
                    <div className="w-full aspect-[3/4] overflow-hidden border-l-4 border-mtc-gold shadow-2xl relative">
                      {portraitError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-mtc-charcoal to-[#2d2d2d]">
                          <span className="text-8xl font-serif text-white/20 font-bold">AS</span>
                          <span className="text-xs text-white/30 uppercase tracking-widest mt-4">Chairman</span>
                        </div>
                      ) : (
                        <img
                          src="/images/abba-photo.jpg"
                          alt="A.S. Abba — Chairman, MTC Group of Companies"
                          className="w-full h-full object-cover object-top"
                          onError={() => setPortraitError(true)}
                        />
                      )}
                    </div>
                    {/* Gold bar accent */}
                    <div className="absolute bottom-0 left-4 right-0 h-1 bg-mtc-red" />
                  </div>

                  {/* Bio Card */}
                  <div className="bg-mtc-grey border border-gray-200 p-8">
                    <span className="text-mtc-red font-bold text-xs uppercase tracking-widest block mb-3">About the Chairman</span>
                    <h2 className="text-2xl font-serif font-bold text-mtc-charcoal mb-1">A.S. Abba</h2>
                    <p className="text-sm text-gray-500 uppercase tracking-wider mb-5">Chairman &amp; Group Chief Executive</p>

                    <div className="space-y-4 text-sm text-gray-600 font-light leading-relaxed border-t border-gray-200 pt-5">
                      <p>
                        A.S. Abba is the founder and Chairman of MTC Group of Companies, a global energy and investment group operating across Africa, the Middle East, Europe, and Asia.
                      </p>
                      <p>
                        With over two decades of experience in international energy trading, infrastructure development, and cross-border investment, Mr. Abba has steered MTC Group from its origins into a diversified enterprise spanning eight high-impact industry sectors.
                      </p>
                      <p>
                        Under his leadership, MTC Group has established a presence in more than 20 countries, managing a network of 2,300+ filling stations and employing over 10,000 professionals worldwide.
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-200 space-y-2 text-xs text-gray-500 uppercase tracking-wider">
                      <div className="flex justify-between">
                        <span>Headquarters</span>
                        <span className="text-mtc-charcoal font-semibold">Washington D.C., USA</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Countries of Operation</span>
                        <span className="text-mtc-charcoal font-semibold">20+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sectors</span>
                        <span className="text-mtc-charcoal font-semibold">8</span>
                      </div>
                    </div>
                  </div>

                  {/* Nav links */}
                  <div className="mt-4 flex gap-3">
                    <Link href="/leadership" className="flex-1">
                      <button className="w-full py-3 text-sm font-semibold text-mtc-charcoal border border-mtc-charcoal hover:bg-mtc-charcoal hover:text-white transition-colors uppercase tracking-wide">
                        Leadership Team
                      </button>
                    </Link>
                    <Link href="/about" className="flex-1">
                      <button className="w-full py-3 text-sm font-semibold text-white bg-mtc-red hover:bg-red-800 transition-colors uppercase tracking-wide">
                        Our Story
                      </button>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Strip */}
      <div className="bg-mtc-charcoal py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-serif text-white font-bold mb-3">Explore Partnership Opportunities</h3>
          <p className="text-white/60 font-light mb-8">
            Connect with MTC Group for investment, trading, and infrastructure collaboration across global markets.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact">
              <button className="px-10 py-4 bg-mtc-red text-white font-semibold hover:bg-red-800 transition-colors uppercase tracking-wide text-sm">
                Contact Us
              </button>
            </Link>
            <Link href="/partnerships">
              <button className="px-10 py-4 border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors uppercase tracking-wide text-sm">
                Partner With Us
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
