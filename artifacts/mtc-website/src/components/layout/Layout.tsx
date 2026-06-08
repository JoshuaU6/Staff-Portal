import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, MapPin, Mail, Phone, Linkedin, Twitter, Facebook,
  ChevronRight, ChevronDown, Search, Flame, TrendingUp, Wheat,
  Warehouse, Building2, HeartPulse, GraduationCap, Cpu, Leaf, Newspaper, Briefcase,
  Globe,
} from "lucide-react";
import { SearchModal } from "@/components/SearchModal";
import { useTranslation } from "@/hooks/useTranslation";

interface LayoutProps {
  children: ReactNode;
}

const SECTOR_ITEMS = [
  { nameKey: "sectors.energy",          href: "/sectors/energy-petroleum", icon: Flame },
  { nameKey: "sectors.trading",         href: "/sectors/trading",          icon: TrendingUp },
  { nameKey: "sectors.agriculture",     href: "/sectors/agriculture",      icon: Wheat },
  { nameKey: "sectors.infrastructure",  href: "/sectors/infrastructure",   icon: Warehouse },
  { nameKey: "sectors.real_estate",     href: "/sectors/real-estate",      icon: Building2 },
  { nameKey: "sectors.healthcare",      href: "/sectors/healthcare",       icon: HeartPulse },
  { nameKey: "sectors.education",       href: "/sectors/education",        icon: GraduationCap },
  { nameKey: "sectors.technology",      href: "/sectors/technology",       icon: Cpu },
];

const PRIMARY_NAV = [
  { nameKey: "nav.about",          href: "/about" },
  { nameKey: "nav.sectors",        href: "/sectors", hasDropdown: true },
  { nameKey: "nav.subsidiaries",   href: "/subsidiaries" },
  { nameKey: "nav.leadership",     href: "/leadership" },
  { nameKey: "nav.chairman",       href: "/chairman" },
  { nameKey: "nav.sustainability", href: "/sustainability", icon: Leaf },
  { nameKey: "nav.news",           href: "/news",           icon: Newspaper },
  { nameKey: "nav.careers",        href: "/careers",        icon: Briefcase },
  { nameKey: "nav.contact",        href: "/contact" },
];

type NavItem = { nameKey: string; href: string; isSubItem?: boolean };

const MOBILE_NAV_BASE: NavItem[] = [
  { nameKey: "nav.home",            href: "/" },
  { nameKey: "nav.about",           href: "/about" },
  { nameKey: "nav.sectors",         href: "/sectors" },
  { nameKey: "nav.subsidiaries",    href: "/subsidiaries" },
  { nameKey: "nav.leadership",      href: "/leadership" },
  { nameKey: "nav.chairman",        href: "/chairman" },
  { nameKey: "nav.global_presence", href: "/global-presence" },
  { nameKey: "nav.sustainability",  href: "/sustainability" },
  { nameKey: "nav.news",            href: "/news" },
  { nameKey: "nav.careers",         href: "/careers" },
  { nameKey: "nav.contact",         href: "/contact" },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSectorsDropdownOpen, setIsSectorsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const sectorsDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { t, LANGUAGES, currentLang, changeLanguage } = useTranslation();

  const isHomePage = location === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSectorsDropdownOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sectorsDropdownRef.current && !sectorsDropdownRef.current.contains(e.target as Node)) {
        setIsSectorsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDarkNav = isHomePage && !isScrolled;
  const navBg = isDarkNav ? "bg-transparent py-5" : "bg-white shadow-md py-3";
  const linkColor = isDarkNav ? "text-white/90 hover:text-white" : "text-mtc-charcoal hover:text-mtc-red";
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const MOBILE_NAV = [
    ...MOBILE_NAV_BASE.slice(0, 3),
    ...SECTOR_ITEMS.map((s) => ({ nameKey: s.nameKey, href: s.href, isSubItem: true })),
    ...MOBILE_NAV_BASE.slice(3),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-mtc-charcoal">

      {/* Top Bar */}
      <div className="hidden lg:flex justify-between items-center px-8 py-2 bg-mtc-charcoal text-white/70 text-xs">
        <div className="flex space-x-6">
          <span className="flex items-center">
            <MapPin className="w-3 h-3 mr-2 text-mtc-red" />
            {t("topbar.headquarters")}
          </span>
          <span className="flex items-center">
            <Phone className="w-3 h-3 mr-2 text-mtc-red" />
            {t("topbar.phone")}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/sustainability" className="hover:text-white transition-colors flex items-center gap-1">
            <Leaf className="w-3 h-3 text-green-400" /> {t("topbar.sustainability")}
          </Link>
          <Link href="/news" className="hover:text-white transition-colors">{t("topbar.news")}</Link>
          <Link href="/careers" className="hover:text-white transition-colors">{t("topbar.careers")}</Link>
          <a href="mailto:contact@mtc-groups.com" className="flex items-center hover:text-white transition-colors">
            <Mail className="w-3 h-3 mr-2 text-mtc-red" />
            contact@mtc-groups.com
          </a>
          {/* Language selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
              data-testid="website-language-switcher"
              aria-label="Change language"
            >
              <Globe className="w-3 h-3" />
              <span>{LANGUAGES.find((l) => l.code === currentLang)?.nativeLabel ?? "English"}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
            {isLangOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-mtc-charcoal border border-white/10 rounded-sm shadow-xl z-50 overflow-hidden">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setIsLangOpen(false); }}
                    className={`flex items-center justify-between w-full px-4 py-2 text-xs transition-colors ${lang.code === currentLang ? "text-mtc-red bg-white/5" : "text-white/70 hover:text-white hover:bg-white/5"}`}
                    data-testid={`website-lang-${lang.code}`}
                  >
                    <span>{lang.nativeLabel}</span>
                    <span className="opacity-50">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <a
            href="/portal/login"
            className="flex items-center gap-1.5 px-3 py-1 border border-mtc-red/50 text-mtc-red hover:bg-mtc-red hover:text-white transition-colors text-xs font-semibold tracking-wide uppercase"
            data-testid="link-staff-portal"
          >
            {t("topbar.staff_portal")}
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${navBg} ${isHomePage && !isScrolled ? 'top-0 lg:top-[33px]' : 'top-0'}`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" aria-label="MTC Group — Home">
              <img
                src={`${import.meta.env.BASE_URL}images/mtc-logo.png`}
                alt="MTC Group of Companies logo"
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main navigation">
              {PRIMARY_NAV.map((link) => {
                if (link.hasDropdown) {
                  return (
                    <div key={link.nameKey} className="relative" ref={sectorsDropdownRef}>
                      <button
                        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors relative ${linkColor}`}
                        onClick={() => setIsSectorsDropdownOpen(!isSectorsDropdownOpen)}
                        aria-expanded={isSectorsDropdownOpen}
                        aria-haspopup="true"
                      >
                        {t(link.nameKey)}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSectorsDropdownOpen ? 'rotate-180' : ''}`} />
                        {(location === link.href || location.startsWith("/sectors/")) && (
                          <motion.div
                            layoutId="nav-indicator"
                            className="absolute bottom-0 left-0 w-full h-[2px] bg-mtc-red"
                            initial={false}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </button>

                      <AnimatePresence>
                        {isSectorsDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.18 }}
                            className="absolute top-full left-0 mt-2 w-64 bg-white shadow-2xl border-t-4 border-mtc-red z-50"
                          >
                            <div className="py-2">
                              <Link
                                href="/sectors"
                                className="block px-5 py-3 text-xs font-bold uppercase tracking-widest text-mtc-red hover:bg-mtc-grey border-b border-gray-100"
                                onClick={() => setIsSectorsDropdownOpen(false)}
                              >
                                {t("nav.view_all_sectors")}
                              </Link>
                              {SECTOR_ITEMS.map((sector) => {
                                const Icon = sector.icon;
                                return (
                                  <Link
                                    key={sector.nameKey}
                                    href={sector.href}
                                    onClick={() => setIsSectorsDropdownOpen(false)}
                                    className="flex items-center gap-3 px-5 py-3 text-sm text-mtc-charcoal hover:bg-mtc-grey hover:text-mtc-red transition-colors group"
                                  >
                                    <Icon className="w-4 h-4 text-mtc-red opacity-70 group-hover:opacity-100 flex-shrink-0" />
                                    {t(sector.nameKey)}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.nameKey}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors relative ${linkColor}`}
                    aria-current={location === link.href ? "page" : undefined}
                  >
                    {t(link.nameKey)}
                    {location === link.href && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-mtc-red"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 ml-1 transition-colors ${linkColor}`}
                aria-label="Search site"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              <Link href="/partnerships" className="ml-2">
                <button className="bg-mtc-red text-white hover:bg-red-800 transition-colors rounded px-5 py-2 text-sm font-semibold">
                  {t("nav.partner_with_us")}
                </button>
              </Link>
            </nav>

            {/* Mobile: search + hamburger */}
            <div className="xl:hidden flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 ${isDarkNav ? 'text-white' : 'text-mtc-charcoal'}`}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className={`p-2 ${isDarkNav ? 'text-white' : 'text-mtc-charcoal'}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 xl:hidden"
              onClick={closeMobileMenu}
            />
            <motion.nav
              id="mobile-nav"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 xl:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <img src={`${import.meta.env.BASE_URL}images/mtc-logo.png`} alt="MTC Group" className="h-10 w-auto object-contain" />
                <button onClick={closeMobileMenu} className="p-2 text-mtc-charcoal">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col py-4 px-6 space-y-0.5 flex-grow overflow-y-auto">
                {MOBILE_NAV.map((link) => (
                  <Link
                    key={link.href + link.nameKey}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`text-sm py-2.5 border-b border-gray-100 flex justify-between items-center transition-colors ${
                      link.isSubItem
                        ? "pl-4 text-gray-500 hover:text-mtc-red border-0 py-1.5"
                        : location === link.href
                        ? "text-mtc-red font-semibold"
                        : "text-mtc-charcoal hover:text-mtc-red"
                    }`}
                  >
                    {link.isSubItem ? `· ${t(link.nameKey)}` : t(link.nameKey)}
                    {!link.isSubItem && <ChevronRight className="w-4 h-4 opacity-40" />}
                  </Link>
                ))}
              </div>
              <div className="px-6 py-6 border-t border-gray-100 space-y-3">
                <a
                  href="/portal/login"
                  onClick={closeMobileMenu}
                  data-testid="mobile-link-staff-portal"
                  className="block w-full border border-mtc-red text-mtc-red text-center rounded px-5 py-3 text-base font-medium hover:bg-mtc-red hover:text-white transition-colors"
                >
                  {t("topbar.staff_portal")}
                </a>
                <Link href="/partnerships" onClick={closeMobileMenu}>
                  <button className="w-full bg-mtc-red text-white rounded px-5 py-3 text-base font-medium hover:bg-red-800 transition-colors">
                    {t("nav.partner_with_us")}
                  </button>
                </Link>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Content */}
      <main className="flex-grow flex flex-col" id="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-mtc-charcoal pt-16" aria-label="Site footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

            {/* Col 1 — Brand */}
            <div className="lg:col-span-1 space-y-5">
              <Link href="/">
                <img
                  src={`${import.meta.env.BASE_URL}images/mtc-logo.png`}
                  alt="MTC Group of Companies logo"
                  className="h-32 w-auto object-contain"
                />
              </Link>
              <p className="text-white/60 text-sm leading-relaxed">
                {t("footer.tagline")}
              </p>
              <div className="flex space-x-3">
                <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-mtc-red transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Twitter / X" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-mtc-red transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-mtc-red transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2 — Company */}
            <div>
              <h4 className="text-mtc-gold font-serif text-base mb-5 uppercase tracking-wider">{t("footer.company")}</h4>
              <ul className="space-y-3">
                {[
                  { labelKey: "footer.about",           href: "/about" },
                  { labelKey: "footer.leadership",      href: "/leadership" },
                  { labelKey: "footer.subsidiaries",    href: "/subsidiaries" },
                  { labelKey: "footer.global_presence", href: "/global-presence" },
                  { labelKey: "footer.sustainability",  href: "/sustainability" },
                  { labelKey: "footer.news",            href: "/news" },
                  { labelKey: "footer.careers",         href: "/careers" },
                ].map((l) => (
                  <li key={l.labelKey}>
                    <Link href={l.href} className="text-white/60 hover:text-white text-sm transition-colors flex items-center group">
                      <ChevronRight className="w-3 h-3 mr-2 text-mtc-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t(l.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Sectors */}
            <div>
              <h4 className="text-mtc-gold font-serif text-base mb-5 uppercase tracking-wider">{t("footer.our_sectors")}</h4>
              <ul className="space-y-3">
                {SECTOR_ITEMS.map((s) => (
                  <li key={s.nameKey}>
                    <Link href={s.href} className="text-white/60 hover:text-white text-sm transition-colors flex items-center group">
                      <ChevronRight className="w-3 h-3 mr-2 text-mtc-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      {t(s.nameKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Our Companies */}
            <div>
              <h4 className="text-mtc-gold font-serif text-base mb-5 uppercase tracking-wider">{t("footer.our_companies")}</h4>
              <ul className="space-y-3 mb-8">
                <li>
                  <Link href="/subsidiaries" className="text-white/60 hover:text-white text-sm transition-colors flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-2 text-mtc-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    MainKey Limited
                  </Link>
                </li>
                <li>
                  <Link href="/subsidiaries" className="text-white/60 hover:text-white text-sm transition-colors flex items-center group">
                    <ChevronRight className="w-3 h-3 mr-2 text-mtc-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                    Safwad Limited
                  </Link>
                </li>
              </ul>
              <h4 className="text-mtc-gold font-serif text-base mb-5 uppercase tracking-wider">{t("footer.offices")}</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Washington D.C., USA</li>
                <li>London, UK</li>
                <li>Paris, France</li>
                <li>Lagos, Nigeria</li>
                <li>Hong Kong</li>
              </ul>
            </div>

            {/* Col 5 — Contact */}
            <div>
              <h4 className="text-mtc-gold font-serif text-base mb-5 uppercase tracking-wider">{t("footer.get_in_touch")}</h4>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start text-sm text-white/60">
                  <Mail className="w-4 h-4 mr-3 text-mtc-red shrink-0 mt-0.5" />
                  <a href="mailto:contact@mtc-groups.com" className="hover:text-white transition-colors">contact@mtc-groups.com</a>
                </li>
                <li className="flex items-start text-sm text-white/60">
                  <Phone className="w-4 h-4 mr-3 text-mtc-red shrink-0 mt-0.5" />
                  <span>+1 771 240 1273</span>
                </li>
                <li className="flex items-start text-sm text-white/60">
                  <MapPin className="w-4 h-4 mr-3 text-mtc-red shrink-0 mt-0.5" />
                  <span>Washington Business District, DC 20001, USA</span>
                </li>
              </ul>
              <Link href="/contact">
                <button className="w-full bg-mtc-red text-white text-sm font-semibold py-3 px-4 hover:bg-red-800 transition-colors uppercase tracking-wide">
                  {t("footer.contact_us")}
                </button>
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/40">
            <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
            <div className="flex items-center gap-4">
              <Link href="/contact" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
              <span>|</span>
              <Link href="/contact" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
              <span>|</span>
              <Link href="/contact" className="hover:text-white transition-colors">{t("footer.cookies")}</Link>
              <span>|</span>
              <Link href="/sustainability" className="hover:text-white transition-colors">{t("footer.esg")}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
