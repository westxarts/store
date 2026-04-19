import { motion } from "framer-motion";
import { useSiteContent } from "@/lib/store-hooks";

export function HeroSection() {
  const { content } = useSiteContent();

  const title = content.hero_title || "Elegance, Redefined.";
  const subtitle = content.hero_subtitle || "Premium fashion bags crafted for the modern Nigerian woman.";
  const buttonText = content.hero_button_text || "Shop Now";
  const badgeText = content.hero_badge_text || "New Collection 2026";

  // Split title on comma for styling
  const [titlePart1, titlePart2] = title.includes(",")
    ? [title.split(",")[0] + ",", title.split(",").slice(1).join(",").trim()]
    : [title, ""];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-[oklch(0.30_0.15_290)] to-[oklch(0.20_0.12_300)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-[oklch(0.50_0.20_280)]/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[80px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-5 py-32 text-center md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-body text-xs font-medium uppercase tracking-[0.25em] text-white/70">
              {badgeText}
            </span>
          </motion.div>

          <h1 className="font-display text-5xl font-extralight leading-[1.1] tracking-tight text-white md:text-7xl lg:text-8xl">
            {titlePart1}
            {titlePart2 && (
              <>
                <br />
                <span className="font-semibold italic">{titlePart2}</span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-white/60 md:text-lg">
            {subtitle}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#products"
              className="inline-flex items-center rounded-full bg-white px-8 py-4 font-body text-sm font-semibold uppercase tracking-wider text-[oklch(0.20_0.12_300)] shadow-lg shadow-white/10 transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20"
            >
              {buttonText}
            </a>
            <a
              href="#why-us"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white/80 backdrop-blur-sm transition-all hover:bg-white/10"
            >
              Learn More
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex h-14 w-8 items-start justify-center rounded-full border-2 border-white/20 pt-2"
        >
          <div className="h-2 w-1 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
