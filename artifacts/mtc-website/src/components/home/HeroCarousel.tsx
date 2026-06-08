import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    image: "/images/hero1.jpg",
    title: "Powering Global Energy",
    subtitle: "World-class refinery operations and energy infrastructure delivering industrial excellence around the clock.",
    cta: "Explore Energy",
    href: "/sectors/energy-petroleum"
  },
  {
    image: "/images/hero2.jpg",
    title: "Energy & Petroleum",
    subtitle: "Global petroleum supply chains, refinery participation, and fuel distribution networks across four continents.",
    cta: "Our Sectors",
    href: "/sectors"
  },
  {
    image: "/images/hero3.jpg",
    title: "Global Maritime Trade",
    subtitle: "Strategic port operations and tanker logistics connecting international markets through seamless energy supply chains.",
    cta: "Partner With Us",
    href: "/contact"
  },
  {
    image: "/images/hero4.jpg",
    title: "MTC Gulf Bay Refinery",
    subtitle: "Our flagship refinery facility — a landmark investment in clean, efficient, and large-scale petroleum processing.",
    cta: "Learn More",
    href: "/about"
  },
  {
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80",
    title: "Building Sustainable Industries",
    subtitle: "Strategic investment and operational excellence across energy, infrastructure, real estate, and trade.",
    cta: "Partner With Us",
    href: "/contact"
  },
  {
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920&q=80",
    title: "Infrastructure Development",
    subtitle: "Tank farms, petroleum storage, industrial infrastructure, and energy logistics at scale.",
    cta: "Explore Our Sectors",
    href: "/sectors"
  },
  {
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80",
    title: "Global Reach",
    subtitle: "Operating across four continents through strategic partnerships and international business networks.",
    cta: "Our Global Presence",
    href: "/global-presence"
  },
  {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80",
    title: "Technology & Innovation",
    subtitle: "Digital solutions, IT infrastructure, and technology services powering our group's operational backbone.",
    cta: "Explore Technology",
    href: "/sectors/technology"
  },
  {
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&q=80",
    title: "Healthcare & Education",
    subtitle: "Hospital investments, medical infrastructure development, and world-class educational institutions.",
    cta: "Contact Us",
    href: "/contact"
  }
];

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-screen min-h-[600px] overflow-hidden bg-mtc-navy group">
      {/* Animated diagonal red accent lines — CSS only */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
        <div className="hero-diagonal-line" />
        <div className="hero-diagonal-line hero-diagonal-line-2" />
      </div>

      <div className="embla w-full h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {slides.map((slide, index) => (
            <div className="embla__slide relative h-full w-full flex-shrink-0" key={index}>
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-mtc-navy/90 via-mtc-navy/70 to-transparent mix-blend-multiply" />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-3xl">
                    <AnimatePresence mode="wait">
                      {selectedIndex === index && (
                        <motion.div
                          key={`content-${index}`}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -30 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          <div className="flex items-center space-x-4 mb-6">
                            <div className="h-px w-12 bg-mtc-gold" />
                            <span className="text-mtc-gold uppercase tracking-[0.3em] text-sm font-bold">MTC Group</span>
                          </div>
                          
                          <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-6">
                            {slide.title}
                          </h1>
                          
                          <p className="text-xl md:text-2xl text-white/90 font-light mb-10 max-w-2xl leading-relaxed">
                            {slide.subtitle}
                          </p>
                          
                          <Link href={slide.href}>
                            <Button size="lg" className="text-base tracking-wide uppercase px-8">
                              {slide.cta}
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === selectedIndex 
                ? "w-10 h-2 bg-mtc-gold" 
                : "w-2 h-2 bg-white/50 hover:bg-white"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
