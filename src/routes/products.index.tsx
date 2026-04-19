import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStoreProducts, formatPrice } from "@/lib/store-hooks";
import { products as fallbackProducts } from "@/data/products";

const PRODUCTS_PER_PAGE = 10;

export const Route = createFileRoute("/products/")({
  head: () => ({
    meta: [
      { title: "Shop All Products — One Emporium" },
      { name: "description", content: "Browse our full collection of premium fashion bags. Handcrafted leather totes, crossbody bags, and clutches." },
      { property: "og:title", content: "Shop All Products — One Emporium" },
      { property: "og:description", content: "Browse our curated collection of premium fashion bags for the modern Nigerian woman." },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products: dbProducts, loading } = useStoreProducts();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
  const [priceRange, setPriceRange] = useState<"all" | "under50k" | "50k-100k" | "over100k">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const products = dbProducts.length > 0
    ? dbProducts
    : fallbackProducts.map(p => ({
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

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (stockFilter === "in_stock") result = result.filter(p => p.in_stock);
    if (stockFilter === "out_of_stock") result = result.filter(p => !p.in_stock);

    if (priceRange === "under50k") result = result.filter(p => p.price < 50000);
    if (priceRange === "50k-100k") result = result.filter(p => p.price >= 50000 && p.price <= 100000);
    if (priceRange === "over100k") result = result.filter(p => p.price > 100000);

    if (categoryFilter !== "all") result = result.filter(p => p.category === categoryFilter);

    return result;
  }, [products, stockFilter, priceRange, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const activeFilterCount = [stockFilter !== "all", priceRange !== "all", categoryFilter !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setStockFilter("all");
    setPriceRange("all");
    setCategoryFilter("all");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 md:px-8 md:pt-36">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Our Collection
          </p>
          <h1 className="font-display text-4xl font-light text-foreground md:text-5xl">
            All Products
          </h1>
        </motion.div>

        {/* Filter Bar */}
        <div className="mb-8 flex items-center justify-between">
          <p className="font-body text-sm text-muted-foreground">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-body text-sm text-foreground transition-colors hover:bg-accent active:scale-95"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-body text-sm font-semibold text-foreground">Filters</h3>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="font-body text-xs text-primary hover:underline">
                    Clear all
                  </button>
                )}
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {/* Price Range */}
              <div>
                <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all" as const, label: "All" },
                    { value: "under50k" as const, label: "Under ₦50k" },
                    { value: "50k-100k" as const, label: "₦50k – ₦100k" },
                    { value: "over100k" as const, label: "Over ₦100k" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setPriceRange(opt.value); setPage(1); }}
                      className={`rounded-full px-3 py-1.5 font-body text-xs transition-colors ${
                        priceRange === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all" as const, label: "All" },
                    { value: "in_stock" as const, label: "In Stock" },
                    { value: "out_of_stock" as const, label: "Out of Stock" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setStockFilter(opt.value); setPage(1); }}
                      className={`rounded-full px-3 py-1.5 font-body text-xs transition-colors ${
                        stockFilter === opt.value
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <p className="mb-2 font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setCategoryFilter("all"); setPage(1); }}
                      className={`rounded-full px-3 py-1.5 font-body text-xs transition-colors ${
                        categoryFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-foreground hover:bg-accent"
                      }`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setCategoryFilter(cat); setPage(1); }}
                        className={`rounded-full px-3 py-1.5 font-body text-xs capitalize transition-colors ${
                          categoryFilter === cat
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-foreground hover:bg-accent"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card shadow-sm overflow-hidden">
                <div className="aspect-square w-full animate-pulse bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-body text-lg text-muted-foreground">No products found</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="mt-3 font-body text-sm text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {paginated.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="h-full"
              >
                <Link
                  to="/products/$productId"
                  params={{ productId: product.id }}
                  className="product-card-hover group flex h-full flex-col cursor-pointer overflow-hidden rounded-2xl bg-card shadow-sm"
                >
                  <div className="relative aspect-square w-full overflow-hidden">
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
                  <div className="flex flex-1 flex-col p-4">
                    <h3
                      className="font-display text-sm font-semibold leading-snug text-card-foreground sm:text-base overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "2.5rem",
                      }}
                    >
                      {product.name}
                    </h3>
                    <span className="mt-2 block font-body text-base font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <div className="mt-auto pt-3 md:hidden">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-wider text-primary-foreground transition-transform active:scale-95">
                        <ShoppingBag size={12} />
                        Shop Now
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 font-body text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full font-body text-sm transition-colors ${
                    page === p
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 font-body text-sm text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
