import { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight } from "lucide-react";

export interface Project {
  title: string;
  description: string;
  image?: string;
  video?: string;
  tags?: string[];
}

interface SectorDetailLayoutProps {
  sectorName: string;
  sectorSlug: string;
  tagline: string;
  overview: string;
  heroImage: string;
  projects: Project[];
  capabilities: string[];
  children?: ReactNode;
}

export function SectorDetailLayout({
  sectorName,
  tagline,
  overview,
  heroImage,
  projects,
  capabilities,
}: SectorDetailLayoutProps) {
  return (
    <Layout>
      {/* Hero */}
      <div
        className="relative pt-40 pb-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-mtc-charcoal/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/sectors" className="inline-flex items-center text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to All Sectors
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-mtc-red" />
              <span className="text-mtc-red uppercase tracking-widest text-sm font-bold">MTC Group</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-white font-bold mb-5">{sectorName}</h1>
            <p className="text-xl text-white/80 max-w-3xl font-light">{tagline}</p>
          </motion.div>
        </div>
      </div>

      {/* Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16">
            <motion.div
              className="lg:w-[60%]"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-4 block">Sector Overview</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-mtc-charcoal mb-6 leading-tight">
                Our Capabilities in {sectorName}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed font-light">{overview}</p>
            </motion.div>

            <motion.div
              className="lg:w-[40%]"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <div className="bg-mtc-grey p-8 border-l-4 border-mtc-red">
                <h3 className="text-lg font-bold text-mtc-charcoal mb-6 uppercase tracking-wide">Key Capabilities</h3>
                <ul className="space-y-3">
                  {capabilities.map((cap) => (
                    <li key={cap} className="flex items-start text-gray-700">
                      <ChevronRight className="w-5 h-5 text-mtc-red mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-light">{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Projects & Portfolio */}
      <section className="py-20 bg-mtc-grey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-mtc-red font-bold tracking-widest text-sm uppercase mb-3 block">Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-mtc-charcoal mb-3">Projects & Engagements</h2>
            <div className="h-1 w-20 bg-mtc-red" />
          </motion.div>

          <div className="space-y-16">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-0 bg-white shadow-lg overflow-hidden`}
              >
                {/* Media */}
                <div className="lg:w-[55%] relative overflow-hidden bg-mtc-charcoal">
                  {project.video ? (
                    <video
                      src={project.video}
                      controls
                      preload="metadata"
                      className="w-full h-72 lg:h-full object-cover"
                      aria-label={`Video: ${project.title}`}
                    />
                  ) : project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-72 lg:h-full object-cover hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="lg:w-[45%] p-8 md:p-10 flex flex-col justify-center">
                  {project.tags && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-xs px-3 py-1 bg-mtc-red/10 text-mtc-red font-semibold tracking-wide rounded-full uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-2xl font-serif font-bold text-mtc-charcoal mb-4">{project.title}</h3>
                  <div className="h-0.5 w-12 bg-mtc-red mb-5" />
                  <p className="text-gray-600 font-light leading-relaxed">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-mtc-charcoal">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-white font-bold mb-5">
            Engage with MTC Group
          </h2>
          <p className="text-white/70 mb-8 text-lg font-light">
            To discuss commercial opportunities or engagements in the {sectorName} sector, contact our team directly.
          </p>
          <Link href="/contact">
            <button className="bg-mtc-red text-white px-8 py-4 text-base font-semibold hover:bg-red-800 transition-colors uppercase tracking-wide">
              Contact Our Team
            </button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
