import { Layout } from "@/components/layout/Layout";
import { GlobalClock } from "@/components/GlobalClock";
import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";

const LOCATIONS = [
  {
    city: "Washington, D.C.",
    country: "USA",
    flag: "🇺🇸",
    address: "Washington Business District, Washington, DC 20001",
    phone: "+1 771 240 1273",
    isHQ: true
  },
  {
    city: "London",
    country: "UK",
    flag: "🇬🇧",
    address: "City of London Business District, London EC2",
    phone: "+44 747 619 8795",
    isHQ: false
  },
  {
    city: "Paris",
    country: "France",
    flag: "🇫🇷",
    address: "Central Business District, 75008 Paris",
    phone: "+33 756 756 465",
    isHQ: false
  },
  {
    city: "Lagos",
    country: "Nigeria",
    flag: "🇳🇬",
    address: "Victoria Island Business District, Lagos",
    phone: "0700 311 7444",
    isHQ: false
  },
  {
    city: "Hong Kong",
    country: "Hong Kong",
    flag: "🇭🇰",
    address: "Central Business District",
    phone: "+1 771 240 1273",
    isHQ: false
  }
];

export default function GlobalPresence() {
  return (
    <Layout>
      <div className="bg-mtc-charcoal pt-40 pb-24 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-6">Global Presence</h1>
            <div className="h-1 w-24 bg-mtc-red mx-auto mb-8" />
            <p className="text-xl text-white/80 max-w-2xl mx-auto font-light">
              Operating across four continents through strategic partnerships and international business networks.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/90 text-lg font-semibold tracking-widest uppercase">
              <span>Africa</span>
              <span className="text-mtc-red">|</span>
              <span>Middle East</span>
              <span className="text-mtc-red">|</span>
              <span>Europe</span>
              <span className="text-mtc-red">|</span>
              <span>Asia</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live Global Clocks */}
      <section className="py-16 bg-mtc-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-mtc-gold font-bold tracking-widest text-xs uppercase mb-3 block">Live World Times</span>
            <h2 className="text-2xl font-serif text-white font-bold">Global Operations Clock</h2>
          </div>
          <GlobalClock />
        </div>
      </section>

      <section className="py-24 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {LOCATIONS.map((loc, i) => (
              <motion.div
                key={loc.city}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white p-8 shadow-md hover:shadow-xl transition-shadow relative ${loc.isHQ ? 'border-2 border-mtc-red' : ''}`}
              >
                {loc.isHQ && (
                  <div className="absolute -top-3 right-6 bg-mtc-red text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
                    Headquarters
                  </div>
                )}
                <div className="text-5xl mb-4">{loc.flag}</div>
                <h3 className="text-2xl font-serif font-bold text-mtc-charcoal mb-4">
                  {loc.city}, {loc.country}
                </h3>
                
                <div className="space-y-3 mt-6">
                  <div className="flex items-start text-gray-600 font-light">
                    <MapPin className="w-5 h-5 mr-3 text-mtc-red shrink-0 mt-0.5" />
                    <span>{loc.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600 font-light">
                    <Phone className="w-5 h-5 mr-3 text-mtc-red shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Global Inquiries Banner */}
      <div className="bg-mtc-red text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl font-serif tracking-wide">
            Global Inquiries: <span className="font-bold">+1 771 240 1273</span> | <span className="font-bold">contact@mtc-groups.com</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}
