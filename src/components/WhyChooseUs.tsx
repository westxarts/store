import { motion } from "framer-motion";
import { ShieldCheck, Truck, Heart, Sparkles } from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Quality Assurance",
    desc: "Every bag undergoes rigorous quality checks. We source only the finest materials for lasting elegance.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    desc: "Fast and reliable delivery across Nigeria. Your order arrives safely, beautifully packaged.",
  },
  {
    icon: Heart,
    title: "Customer First",
    desc: "Your satisfaction is our priority. Easy returns and dedicated support for every purchase.",
  },
  {
    icon: Sparkles,
    title: "Exclusive Designs",
    desc: "Curated collections you won't find anywhere else. Stay ahead of every fashion trend.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-us" className="bg-background py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Why One Emporium
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl lg:text-6xl">
            The <span className="italic font-medium">Promise</span>
          </h2>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <r.icon size={24} />
              </div>
              <h3 className="font-display text-xl font-semibold text-card-foreground">
                {r.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                {r.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
