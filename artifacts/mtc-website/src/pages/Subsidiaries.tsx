import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function Subsidiaries() {
  return (
    <Layout>
      <div className="bg-mtc-charcoal pt-40 pb-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Our Group Companies</span>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">Our Subsidiaries</h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto font-light">
              MTC Group executes its global strategy through two principal subsidiaries — each a specialist operator in its respective field.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-16">

            {/* ── MainKey Limited ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white shadow-xl border-t-4 border-mtc-red overflow-hidden"
            >
              <div className="p-10 md:p-14">
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 bg-mtc-red text-white text-xs font-bold tracking-widest uppercase rounded-full">
                    Energy & Commodity Trading
                  </span>
                </div>
                <div className="flex items-center gap-5 mb-4">
                  <img
                    src="/images/mainkey-logo.jpg"
                    alt="MainKey Limited logo"
                    className="h-16 w-auto object-contain flex-shrink-0"
                  />
                  <h2 className="text-4xl font-serif font-bold text-mtc-charcoal leading-tight">MainKey Limited</h2>
                </div>
                <p className="text-xl text-gray-600 font-light mb-8 italic">
                  International energy trading and petroleum supply at global scale.
                </p>
                <p className="text-gray-700 font-light leading-relaxed mb-10 max-w-4xl">
                  MainKey Limited is MTC Group's dedicated energy and commodity trading arm. Operating across international energy markets, MainKey manages the purchase, sale, and delivery of petroleum products and industrial commodities to sovereign buyers, commercial operators, and energy distributors in Africa, the Middle East, Europe, and Asia. The company maintains an extensive network of refinery relationships, terminal access agreements, and logistics infrastructure to deliver reliable and competitive supply.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-lg font-bold text-mtc-charcoal mb-5 uppercase tracking-wide border-b border-gray-100 pb-3">Products Traded</h4>
                    <ul className="space-y-3">
                      {[
                        "Crude Oil (various grades)",
                        "PMS — Premium Motor Spirit",
                        "AGO — Automotive Gas Oil / EN590 Diesel",
                        "LNG — Liquefied Natural Gas",
                        "LPG — Liquefied Petroleum Gas",
                        "Jet A1 Aviation Fuel",
                        "Fertilizer & Industrial Chemicals",
                      ].map((item) => (
                        <li key={item} className="flex items-start text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-mtc-red mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-mtc-charcoal mb-5 uppercase tracking-wide border-b border-gray-100 pb-3">Operational Capabilities</h4>
                    <ul className="space-y-3">
                      {[
                        "Refinery offtake and supply agreements",
                        "Tank farm and petroleum storage management",
                        "International oil & gas transactions",
                        "Fuel distribution network management",
                        "Energy logistics and freight coordination",
                        "Filling station supply operations (2,300+ stations)",
                      ].map((item) => (
                        <li key={item} className="flex items-start text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-mtc-red mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Safwad Limited ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white shadow-xl border-t-4 border-mtc-red overflow-hidden"
            >
              <div className="p-10 md:p-14">
                <div className="mb-6">
                  <span className="inline-block px-4 py-1.5 bg-mtc-red text-white text-xs font-bold tracking-widest uppercase rounded-full">
                    Agriculture, Import/Export & Consumer Goods
                  </span>
                </div>
                <div className="flex items-center gap-5 mb-4">
                  <img
                    src="/images/safwad-logo.jpg"
                    alt="Safwad Limited logo"
                    className="h-16 w-auto object-contain flex-shrink-0"
                  />
                  <h2 className="text-4xl font-serif font-bold text-mtc-charcoal leading-tight">Safwad Limited</h2>
                </div>
                <p className="text-xl text-gray-600 font-light mb-8 italic">
                  Global import, export, and distribution of agricultural and consumer goods.
                </p>
                <p className="text-gray-700 font-light leading-relaxed mb-10 max-w-4xl">
                  Safwad Limited is MTC Group's international trade and consumer goods division. The company manages importation, exportation, and large-scale distribution of agricultural commodities and essential consumer products. Operating across multiple markets, Safwad connects global producers with regional distributors, retailers, and institutional buyers — delivering efficient supply chains for everyday essential goods.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <h4 className="text-lg font-bold text-mtc-charcoal mb-5 uppercase tracking-wide border-b border-gray-100 pb-3">Agricultural Products</h4>
                    <ul className="space-y-3">
                      {[
                        "Grains — wheat, rice, maize",
                        "Pulses and legumes",
                        "Edible oils and fats",
                        "Sugar and related commodities",
                        "Cash crops and export produce",
                      ].map((item) => (
                        <li key={item} className="flex items-start text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-mtc-red mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-mtc-charcoal mb-5 uppercase tracking-wide border-b border-gray-100 pb-3">Consumer & Sanitary Products</h4>
                    <ul className="space-y-3">
                      {[
                        "Diapers and baby care products",
                        "Pampers and absorbent hygiene products",
                        "Feminine sanitary products",
                        "Household consumer goods (FMCG)",
                        "International logistics & supply chain management",
                      ].map((item) => (
                        <li key={item} className="flex items-start text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-mtc-red mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          <span className="font-light">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
