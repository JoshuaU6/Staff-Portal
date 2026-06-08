import { motion } from "framer-motion";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  light?: boolean;
}

export function SectionHeading({ title, subtitle, align = "left", light = false }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left"}`}>
      {subtitle && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`tracking-[0.2em] uppercase text-sm font-bold mb-3 ${light ? "text-mtc-gold-light" : "text-mtc-gold"}`}
        >
          {subtitle}
        </motion.p>
      )}
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-4xl md:text-5xl font-serif ${light ? "text-white" : "text-mtc-navy dark:text-white"}`}
      >
        {title}
      </motion.h2>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: "60px" }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className={`h-1 bg-mtc-gold mt-6 ${align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""}`}
      />
    </div>
  );
}
