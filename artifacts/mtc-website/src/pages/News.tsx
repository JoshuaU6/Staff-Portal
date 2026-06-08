import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, ChevronRight, Tag } from "lucide-react";

const NEWS_ARTICLES = [
  {
    id: 1,
    category: "Energy",
    tag: "Crude Oil",
    date: "March 12, 2026",
    title: "MTC Group Expands Crude Oil Offtake Portfolio Across West Africa",
    excerpt: "MTC Group, through its subsidiary MainKey Limited, has secured new long-term crude oil offtake agreements with sovereign energy entities across West Africa, reinforcing the group's position as a major petroleum supply chain operator in the region.",
    image: "/images/hero3.jpg",
    featured: true,
  },
  {
    id: 2,
    category: "Infrastructure",
    tag: "Refinery",
    date: "February 28, 2026",
    title: "Gulf Bay Refinery — Phase II Development Update",
    excerpt: "MTC Group's flagship Gulf Bay Refinery has completed Phase I commissioning and entered Phase II development, significantly expanding throughput capacity and enabling increased domestic and export production of refined petroleum products.",
    image: "/images/hero4.jpg",
    featured: false,
  },
  {
    id: 3,
    category: "Trade",
    tag: "Agriculture",
    date: "February 14, 2026",
    title: "Safwad Limited Launches New Agricultural Import Programme",
    excerpt: "Safwad Limited, the agriculture and consumer goods division of MTC Group, has launched an expanded grain and edible oil import programme connecting South American and Eastern European producers with West African markets.",
    image: "/images/hero1.jpg",
    featured: false,
  },
  {
    id: 4,
    category: "Sustainability",
    tag: "ESG",
    date: "January 30, 2026",
    title: "MTC Group Publishes First Sustainability & ESG Framework",
    excerpt: "MTC Group has released its inaugural Environmental, Social and Governance (ESG) Framework, outlining commitments to responsible energy operations, community investment, and sustainable business practices across all territories of operation.",
    image: "/images/hero2.jpg",
    featured: false,
  },
  {
    id: 5,
    category: "Global Presence",
    tag: "Expansion",
    date: "January 15, 2026",
    title: "MTC Group Strengthens Middle East Operations with New Office Network",
    excerpt: "As part of its strategic expansion, MTC Group has formalised its Middle East operational infrastructure, establishing representative offices to serve the growing demand for energy supply and infrastructure investment in the region.",
    image: "/images/hero1.jpg",
    featured: false,
  },
  {
    id: 6,
    category: "Energy",
    tag: "LNG",
    date: "December 20, 2025",
    title: "MainKey Limited Enters LNG Supply Agreement — 3-Year Term",
    excerpt: "MainKey Limited has executed a three-year LNG supply agreement serving industrial off-takers across sub-Saharan Africa, expanding MTC Group's gas trading activity and deepening its presence in the clean energy supply chain.",
    image: "/images/hero2.jpg",
    featured: false,
  },
];

export default function News() {
  const featured = NEWS_ARTICLES.find((a) => a.featured);
  const rest = NEWS_ARTICLES.filter((a) => !a.featured);

  return (
    <Layout>
      <div className="bg-mtc-charcoal pt-40 pb-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Media & Press</span>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">News & Insights</h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              The latest updates, press releases, and perspectives from MTC Group of Companies.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {featured && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-16"
            >
              <div className="flex flex-col lg:flex-row gap-0 bg-white shadow-xl overflow-hidden border-t-4 border-mtc-red">
                <div className="lg:w-[55%] overflow-hidden">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-full h-64 lg:h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="lg:w-[45%] p-10 md:p-14 flex flex-col justify-center bg-mtc-charcoal">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs px-3 py-1 bg-mtc-red text-white font-bold uppercase tracking-widest rounded-full">
                      Featured
                    </span>
                    <span className="text-xs px-3 py-1 bg-white/10 text-white/70 font-semibold tracking-wide rounded-full uppercase">
                      {featured.tag}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4 leading-snug">
                    {featured.title}
                  </h2>
                  <div className="h-0.5 w-12 bg-mtc-red mb-5" />
                  <p className="text-white/70 font-light leading-relaxed mb-6">{featured.excerpt}</p>
                  <div className="flex items-center text-white/50 text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {featured.date}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white shadow-md hover:shadow-xl transition-shadow group border-t-4 border-transparent hover:border-mtc-red overflow-hidden"
              >
                <div className="overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3 h-3 text-mtc-red" />
                    <span className="text-xs font-bold text-mtc-red uppercase tracking-widest">{article.category}</span>
                    <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {article.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-mtc-charcoal mb-3 leading-snug group-hover:text-mtc-red transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <span className="text-mtc-red text-sm font-semibold flex items-center group-hover:gap-2 transition-all">
                    Read More <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-mtc-red py-14 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-serif text-white font-bold mb-4">Media & Press Enquiries</h2>
          <p className="text-white/80 mb-6 font-light">
            For press releases, interview requests, or media information, contact the MTC Group communications team.
          </p>
          <Link href="/contact">
            <button className="bg-white text-mtc-red font-bold px-8 py-3 uppercase tracking-wide hover:bg-gray-100 transition-colors">
              Contact Press Team
            </button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
