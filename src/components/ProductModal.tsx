import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, CreditCard, Truck } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const [payMethod, setPayMethod] = useState<"paystack" | "delivery">("paystack");

  if (!product) return null;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-accent"
            >
              <X size={18} />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col gap-5 p-6 md:p-8">
                <div>
                  <p className="mb-1 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {product.category}
                  </p>
                  <h2 className="font-display text-3xl font-semibold text-card-foreground">
                    {product.name}
                  </h2>
                  <p className="mt-2 font-display text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {product.fullDescription}
                </p>

                {/* Quantity */}
                <div>
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quantity
                  </p>
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-accent"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="flex h-10 w-12 items-center justify-center font-body text-sm font-semibold text-foreground">
                      {qty}
                    </span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-accent"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Payment method */}
                <div>
                  <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment Method
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPayMethod("paystack")}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                        payMethod === "paystack"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <CreditCard size={16} className="text-primary" />
                      <span className="font-body text-xs font-medium text-foreground">
                        Pay with Card
                      </span>
                    </button>
                    <button
                      onClick={() => setPayMethod("delivery")}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 transition-all ${
                        payMethod === "delivery"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <Truck size={16} className="text-primary" />
                      <span className="font-body text-xs font-medium text-foreground">
                        Pay on Delivery
                      </span>
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
                  <span className="font-body text-sm text-muted-foreground">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-foreground">
                    {formatPrice(product.price * qty)}
                  </span>
                </div>

                {/* CTA */}
                <button className="w-full rounded-full bg-primary py-4 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]">
                  {payMethod === "paystack" ? "Pay Now" : "Place Order"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
