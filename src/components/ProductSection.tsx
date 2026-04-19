import { motion } from "framer-motion";
import { useStoreProducts, formatPrice } from "@/lib/store-hooks";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";

// Fallback to hardcoded products if DB is empty
import { products as fallbackProducts } from "@/data/products";

export function ProductSection() {
  const { products: dbProducts, loading } = useStoreProducts();
  
  // Use DB products if available, otherwise fall back to hardcoded
  const products = dbProducts.length > 0 ? dbProducts : fallbackProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    full_description: p.fullDescription,
    image_url: p.image,
    images: p.images,
    category: p.category,
    in_stock: p.inStock,
  }));

  return (
    <section id="products" className="bg-surface py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Our Collection
          </p>
          <h2 className="font-display text-4xl font-light text-foreground md:text-5xl lg:text-6xl">
            Curated for <span className="italic font-medium">You</span>
          </h2>
        </motion.div>

        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card shadow-sm overflow-hidden">
                <div className="aspect-square w-full animate-pulse bg-muted" />
                <div className="p-5 space-y-2">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 5).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to="/products/$productId"
                    params={{ productId: product.id }}
                    className="product-card-hover group block cursor-pointer overflow-hidden rounded-2xl bg-card shadow-sm"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        loading="lazy"
                        width={800}
                        height={800}
                        className="img-zoom h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 hidden items-center justify-center bg-foreground/0 transition-all duration-500 ease-in-out group-hover:bg-foreground/15 md:flex">
                        <div className="glass-card flex items-center justify-center rounded-full px-6 py-3 opacity-0 scale-90 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:scale-100">
                          <span className="font-body text-sm font-semibold tracking-wider text-foreground">
                            Shop Now
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-semibold text-card-foreground">
                        {product.name}
                      </h3>
                      <span className="mt-1 block font-body text-lg font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      <div className="mt-3 flex items-center justify-between md:hidden">
                        <span className="font-body text-xs text-muted-foreground">
                          Tap to view details
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-transform active:scale-95">
                          <ShoppingBag size={14} />
                          Shop Now
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-14 flex justify-center"
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-8 py-3.5 font-body text-sm font-semibold uppercase tracking-[0.2em] text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-lg active:scale-95"
              >
                View More
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}
