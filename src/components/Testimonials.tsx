import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    name: "Adaeze Okonkwo",
    location: "Lagos",
    text: "The quality of the bags is absolutely stunning. I've received so many compliments on my Noir Executive Tote. One Emporium is now my go-to!",
    rating: 5,
  },
  {
    name: "Funke Adeola",
    location: "Abuja",
    text: "Fast delivery and the packaging was so beautiful. The bag looked even better in person. I'm already eyeing my next purchase!",
    rating: 5,
  },
  {
    name: "Chioma Nwankwo",
    location: "Port Harcourt",
    text: "I was sceptical about buying bags online, but One Emporium exceeded all my expectations. The customer service was incredible.",
    rating: 5,
  },
  {
    name: "Blessing Okafor",
    location: "Enugu",
    text: "Absolutely love the Lavender Day Bag. The colour is even more gorgeous in person. Premium quality at a fair price!",
    rating: 5,
  },
  {
    name: "Amina Yusuf",
    location: "Kano",
    text: "My third purchase from One Emporium and I keep coming back. The attention to detail is unmatched. Highly recommend!",
    rating: 5,
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="testimonials" className="bg-surface py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Testimonials
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl lg:text-6xl">
            What Our <span className="italic font-medium">Customers</span> Say
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {testimonials.map((t, i) => (
                <div
                  key={t.name}
                  className="min-w-0 shrink-0 grow-0 basis-full pl-5 md:basis-1/2 lg:basis-1/3"
                >
                  <div className="relative h-full rounded-2xl border border-border bg-card/60 p-8 backdrop-blur-sm">
                    <Quote size={28} className="mb-4 text-primary/15" />
                    <div className="mb-4 flex gap-1">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star
                          key={j}
                          size={14}
                          className="fill-gold text-gold"
                        />
                      ))}
                    </div>
                    <p className="mb-6 font-body text-sm leading-relaxed text-muted-foreground">
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <div>
                      <p className="font-display text-base font-semibold text-card-foreground">
                        {t.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {t.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-all hover:bg-accent disabled:opacity-30 md:-left-5"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-all hover:bg-accent disabled:opacity-30 md:-right-5"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-6 bg-primary"
                    : "w-2 bg-border hover:bg-primary/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
