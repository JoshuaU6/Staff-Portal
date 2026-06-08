import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const SEARCH_INDEX = [
  { title: "Home", href: "/", category: "Page", keywords: "mtc group home global energy investment" },
  { title: "About MTC Group", href: "/about", category: "Page", keywords: "about who we are history mission" },
  { title: "Our Sectors", href: "/sectors", category: "Page", keywords: "sectors industries business areas" },
  { title: "Energy & Petroleum", href: "/sectors/energy-petroleum", category: "Sector", keywords: "crude oil petroleum refinery tank farm fuel energy" },
  { title: "Trading & Commodities", href: "/sectors/trading", category: "Sector", keywords: "trading commodities mainkey crude oil PMS AGO LNG LPG jet a1" },
  { title: "Agriculture & Consumer Goods", href: "/sectors/agriculture", category: "Sector", keywords: "agriculture consumer goods safwad grains diapers FMCG" },
  { title: "Infrastructure", href: "/sectors/infrastructure", category: "Sector", keywords: "infrastructure tank farms pipelines storage facilities" },
  { title: "Real Estate", href: "/sectors/real-estate", category: "Sector", keywords: "real estate property commercial residential Africa" },
  { title: "Healthcare", href: "/sectors/healthcare", category: "Sector", keywords: "healthcare hospitals medical diagnostic centres" },
  { title: "Education", href: "/sectors/education", category: "Sector", keywords: "education schools vocational training research" },
  { title: "Technology", href: "/sectors/technology", category: "Sector", keywords: "technology digital IT automation enterprise" },
  { title: "Subsidiaries", href: "/subsidiaries", category: "Page", keywords: "subsidiaries mainkey safwad companies" },
  { title: "MainKey Limited", href: "/subsidiaries", category: "Company", keywords: "mainkey crude oil petroleum trading energy" },
  { title: "Safwad Limited", href: "/subsidiaries", category: "Company", keywords: "safwad agriculture consumer goods import export" },
  { title: "Leadership", href: "/leadership", category: "Page", keywords: "leadership chairman board directors management team" },
  { title: "Global Presence", href: "/global-presence", category: "Page", keywords: "global presence offices africa middle east europe asia" },
  { title: "News & Insights", href: "/news", category: "Page", keywords: "news press insights updates media press releases" },
  { title: "Sustainability & ESG", href: "/sustainability", category: "Page", keywords: "sustainability ESG environment social governance green" },
  { title: "Careers", href: "/careers", category: "Page", keywords: "careers jobs employment opportunities roles" },
  { title: "Contact Us", href: "/contact", category: "Page", keywords: "contact email phone address enquiry" },
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const results = query.trim().length >= 2
    ? SEARCH_INDEX.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.keywords.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
          >
            <div className="bg-white shadow-2xl overflow-hidden">
              <div className="flex items-center border-b border-gray-200 px-5 py-4">
                <Search className="w-5 h-5 text-mtc-red mr-3 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search MTC Group — sectors, pages, topics..."
                  className="flex-grow text-lg text-mtc-charcoal outline-none placeholder-gray-400 font-light"
                  aria-label="Search site"
                />
                <button onClick={onClose} className="ml-3 p-1 text-gray-400 hover:text-mtc-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {query.trim().length >= 2 && (
                <div>
                  {results.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500 font-light">
                      No results found for "<span className="font-semibold text-mtc-charcoal">{query}</span>"
                    </div>
                  ) : (
                    <ul>
                      {results.map((item) => (
                        <li key={item.href + item.title}>
                          <Link href={item.href} onClick={onClose}>
                            <div className="flex items-center justify-between px-6 py-4 hover:bg-mtc-grey cursor-pointer group border-b border-gray-100 last:border-0">
                              <div>
                                <span className="text-xs font-bold text-mtc-red uppercase tracking-widest block mb-0.5">
                                  {item.category}
                                </span>
                                <span className="text-mtc-charcoal font-semibold group-hover:text-mtc-red transition-colors">
                                  {item.title}
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-mtc-red transition-colors" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {query.trim().length < 2 && (
                <div className="px-6 py-6">
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Quick Links</p>
                  <div className="flex flex-wrap gap-2">
                    {["Energy & Petroleum", "Trading & Commodities", "Sustainability", "Careers", "News", "Contact"].map((label) => {
                      const match = SEARCH_INDEX.find((i) => i.title === label || i.title.includes(label));
                      return match ? (
                        <Link key={label} href={match.href} onClick={onClose}>
                          <span className="px-3 py-1.5 bg-mtc-grey hover:bg-mtc-red hover:text-white text-mtc-charcoal text-sm font-medium cursor-pointer transition-colors rounded-sm">
                            {label}
                          </span>
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
