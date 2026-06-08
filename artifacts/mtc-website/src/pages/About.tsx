import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ShieldCheck, Target, Leaf } from "lucide-react";

export default function About() {
  return (
    <Layout>
      {/* Page Header */}
      <div className="bg-mtc-charcoal pt-40 pb-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">About MTC Group</h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Powering Global Energy, Trade &amp; Infrastructure.
            </p>
          </motion.div>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:w-[60%]"
            >
              <h2 className="text-4xl font-serif text-mtc-charcoal font-bold mb-8">Who We Are</h2>
              <div className="space-y-6 text-lg text-mtc-charcoal font-light leading-relaxed">
                <p>
                  <strong className="font-bold">MTC Group of Companies</strong> is a diversified international enterprise engaged in oil &amp; gas trading, refinery operations, tank farm storage, filling station networks, infrastructure, real estate, healthcare, education, technology and global trade through its subsidiaries and strategic operations across Africa, the Middle East, Europe and Asia.
                </p>
                <p>
                  MTC Group executes its strategy through two principal subsidiaries: <strong className="font-semibold">MainKey Limited</strong> — our energy and commodity trading arm — and <strong className="font-semibold">Safwad Limited</strong> — our agriculture, import/export, and consumer goods division.
                </p>
                <p>
                  With over 20 countries of operation, 10,000+ employees worldwide, and a distribution network spanning 2,300+ filling stations, MTC Group is built to the scale and standards of the world's leading integrated energy companies.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:w-[40%] w-full"
            >
              <div className="bg-mtc-red text-white p-10 shadow-2xl h-full flex flex-col justify-center">
                <h3 className="text-2xl font-serif font-bold mb-8 text-white">At a Glance</h3>
                <ul className="space-y-6 text-lg">
                  <li className="flex flex-col border-b border-white/20 pb-3">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Founded</span>
                    <span className="font-semibold">Washington, D.C., USA</span>
                  </li>
                  <li className="flex flex-col border-b border-white/20 pb-3">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Operations</span>
                    <span className="font-semibold">Africa | Middle East | Europe | Asia</span>
                  </li>
                  <li className="flex flex-col border-b border-white/20 pb-3">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Sectors</span>
                    <span className="font-semibold">8 core industries</span>
                  </li>
                  <li className="flex flex-col border-b border-white/20 pb-3">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Website</span>
                    <span className="font-semibold">www.mtc-groups.com</span>
                  </li>
                  <li className="flex flex-col">
                    <span className="text-white/70 text-sm uppercase tracking-wider mb-1">Email</span>
                    <span className="font-semibold">contact@mtc-groups.com</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-mtc-charcoal font-bold mb-4">Our Core Values</h2>
            <div className="w-20 h-1 bg-mtc-red mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Transparency",
                desc: "Operating with absolute clarity and honesty across all international boundaries and partnerships.",
                icon: ShieldCheck
              },
              {
                title: "Responsible Management",
                desc: "Ensuring all operations follow sound corporate governance principles and ethical standards.",
                icon: Target
              },
              {
                title: "Sustainable Development",
                desc: "Committing to long-term growth that benefits both stakeholders and the communities we operate in.",
                icon: Leaf
              }
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 shadow-sm border-t-4 border-transparent hover:border-mtc-red hover:shadow-xl transition-all group text-center"
              >
                <div className="w-20 h-20 bg-mtc-red rounded-full flex items-center justify-center text-white mx-auto mb-6 transition-transform group-hover:scale-110">
                  <value.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-mtc-charcoal mb-4">{value.title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
