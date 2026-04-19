import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, CreditCard, Truck, ArrowLeft, MessageCircle, ShieldCheck, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, type ProductColor } from "@/lib/store-hooks";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

import { products as fallbackProducts } from "@/data/products";

export const Route = createFileRoute("/products/$productId")({
  head: ({ params }) => {
    const fb = fallbackProducts.find((p) => p.id === params.productId);
    return {
      meta: [
        { title: fb ? `${fb.name} — One Emporium` : "Product — One Emporium" },
        { name: "description", content: fb?.fullDescription ?? "View product details." },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-display text-3xl text-foreground">Product Not Found</h1>
      <Link to="/" className="font-body text-primary hover:underline">Go Home</Link>
    </div>
  ),
});

interface ProductData {
  id: string;
  name: string;
  price: number;
  description: string;
  full_description: string;
  image_url: string;
  images: string[];
  category: string;
  colors: ProductColor[];
  stock_quantity: number;
  track_stock: boolean;
  in_stock: boolean;
}

function ProductPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [payMethod, setPayMethod] = useState<"paystack" | "delivery">("delivery");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          description: data.description,
          full_description: data.full_description,
          image_url: data.image_url,
          images: data.images?.length ? data.images : [data.image_url],
          category: data.category,
          colors: Array.isArray(data.colors) ? (data.colors as unknown as ProductColor[]) : [],
          stock_quantity: data.stock_quantity,
          track_stock: data.track_stock,
          in_stock: data.in_stock,
        });
      } else {
        const fb = fallbackProducts.find((p) => p.id === productId);
        if (fb) {
          setProduct({
            id: fb.id,
            name: fb.name,
            price: fb.price,
            description: fb.description,
            full_description: fb.fullDescription,
            image_url: fb.image,
            images: fb.images.length ? fb.images : [fb.image],
            category: fb.category,
            colors: [],
            stock_quantity: 0,
            track_stock: false,
            in_stock: fb.inStock,
          });
        }
      }
      setLoading(false);
    }
    load();
  }, [productId]);

  useEffect(() => {
    supabase.from("site_content").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((item) => { map[item.key] = item.value; });
      setSiteContent(map);
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!product) throw notFound();

  const images = product.images.length > 0 ? product.images : [product.image_url];
  const isOutOfStock = product.track_stock ? product.stock_quantity === 0 : !product.in_stock;
  const isLowStock = product.track_stock && product.stock_quantity > 0 && product.stock_quantity <= 5;
  const total = product.price * qty;
  const whatsappNumber = siteContent.whatsapp_order_number || "2348000000000";
  const paystackKey = siteContent.paystack_public_key || "pk_live_ee17c6739aa747dd863dd61a483e0e93b3b51371";

  const stockLabel = isOutOfStock
    ? "Out of stock"
    : isLowStock
    ? `Only ${product.stock_quantity} left`
    : product.track_stock
    ? "In stock"
    : product.in_stock
    ? "In stock"
    : "Out of stock";

  const stockColor = isOutOfStock
    ? "text-destructive"
    : isLowStock
    ? "text-orange-500"
    : "text-green-600";

  const prevImage = () => setSelectedImage((i) => (i === 0 ? images.length - 1 : i - 1));
  const nextImage = () => setSelectedImage((i) => (i === images.length - 1 ? 0 : i + 1));

  const handlePaystack = () => {
    if (isOutOfStock) return;
    setIsProcessing(true);
    const autoEmail = `customer${Date.now()}@oneemporium.com`;
    const txRef = `OE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    try {
      const handler = (window as any).PaystackPop?.setup({
        key: paystackKey,
        email: autoEmail,
        amount: total * 100,
        currency: "NGN",
        ref: txRef,
        metadata: {
          product_name: product.name,
          quantity: qty,
          color: selectedColor || "N/A",
          custom_fields: [
            { display_name: "Product", variable_name: "product", value: product.name },
            { display_name: "Quantity", variable_name: "quantity", value: String(qty) },
            { display_name: "Color", variable_name: "color", value: selectedColor || "N/A" },
          ],
        },
        onClose: () => setIsProcessing(false),
        callback: async (response: any) => {
          await supabase.from("orders").insert({
            customer_name: "Card Payment",
            customer_email: autoEmail,
            product_name: product.name,
            product_id: product.id,
            quantity: qty,
            amount: total,
            payment_type: "paystack",
            payment_ref: response.reference,
            status: "confirmed",
          });
          setIsProcessing(false);
          setPaymentSuccess(true);
          setPaymentRef(response.reference);
        },
      });
      if (handler) {
        handler.openIframe();
      } else {
        setIsProcessing(false);
        alert("Payment service is loading. Please try again.");
      }
    } catch {
      setIsProcessing(false);
      alert("Could not initialize payment. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    if (isOutOfStock) return;
    setIsProcessing(true);
    await supabase.from("orders").insert({
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      product_name: product.name,
      product_id: product.id,
      quantity: qty,
      amount: total,
      payment_type: "delivery",
      status: "pending",
    });

    const colorLine = selectedColor ? `\nColor: ${selectedColor}` : "";
    const message = encodeURIComponent(
      `Hello, I just placed an order on One Emporium.\n\nProduct: ${product.name}${colorLine}\nQuantity: ${qty}\nPrice: ${formatPrice(total)}\nName: ${name}\nPhone: ${phone}\nAddress: ${address}`
    );
    setTimeout(() => {
      setIsProcessing(false);
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header solid />
      <div className="mx-auto max-w-6xl px-5 pt-24 pb-4 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to Collection
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-5 pb-20 md:px-8"
      >
        <div className="grid gap-12 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-2xl bg-card shadow-sm aspect-square">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  src={images[selectedImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImage === idx ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-1 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {product.category}
              </p>
              <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl">
                {product.name}
              </h1>
              <p className="mt-3 font-display text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className={`mt-2 font-body text-sm font-medium ${stockColor}`}>
                {stockLabel}
              </p>
            </div>

            <p className="font-body text-base leading-relaxed text-muted-foreground">
              {product.full_description}
            </p>

            {/* Color Swatches */}
            {product.colors.length > 0 && (
              <div>
                <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Color{selectedColor ? `: ${selectedColor}` : ""}
                </p>
                <div className="flex gap-3">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className={`h-9 w-9 rounded-full border-2 transition-all ${
                        selectedColor === c.name
                          ? "border-primary scale-110 shadow-md"
                          : "border-border hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity</p>
              <div className="inline-flex items-center rounded-full border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={isOutOfStock} className="flex h-12 w-12 items-center justify-center rounded-l-full text-foreground transition-colors hover:bg-accent active:bg-accent/70 disabled:opacity-40">
                  <Minus size={16} />
                </button>
                <span className="flex h-12 w-14 items-center justify-center font-body text-sm font-semibold text-foreground">{qty}</span>
                <button
                  onClick={() => {
                    const max = product.track_stock ? product.stock_quantity : Infinity;
                    setQty((q) => Math.min(q + 1, max));
                  }}
                  disabled={isOutOfStock}
                  className="flex h-12 w-12 items-center justify-center rounded-r-full text-foreground transition-colors hover:bg-accent active:bg-accent/70 disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPayMethod("paystack")}
                  disabled={isOutOfStock}
                  className={`flex items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-[0.97] disabled:opacity-40 ${
                    payMethod === "paystack" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <CreditCard size={18} className="text-primary" />
                  <span className="font-body text-sm font-medium text-foreground">Pay with Card</span>
                </button>
                <button
                  onClick={() => setPayMethod("delivery")}
                  disabled={isOutOfStock}
                  className={`flex items-center gap-2 rounded-xl border-2 p-4 transition-all active:scale-[0.97] disabled:opacity-40 ${
                    payMethod === "delivery" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                  }`}
                >
                  <Truck size={18} className="text-primary" />
                  <span className="font-body text-sm font-medium text-foreground">Pay on Delivery</span>
                </button>
              </div>
            </div>

            {/* Delivery form */}
            {payMethod === "delivery" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 overflow-hidden">
                <p className="font-body text-xs text-muted-foreground">Please enter an active WhatsApp number so we can confirm your order.</p>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                <input type="tel" placeholder="WhatsApp Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                <textarea placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="rounded-xl border border-border bg-background px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </motion.div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between rounded-xl bg-accent/50 px-5 py-4">
              <span className="font-body text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-foreground">{formatPrice(total)}</span>
            </div>

            {/* Success */}
            {paymentSuccess && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-primary" />
                  <span className="font-body text-sm font-medium text-foreground">Payment successful. Your order has been received.</span>
                </div>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I just paid for an order on One Emporium.\n\nProduct: ${product.name}\nQuantity: ${qty}\nPrice: ${formatPrice(total)}\nReference: ${paymentRef}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start rounded-full border border-border px-4 py-2.5 font-body text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <MessageCircle size={14} />
                  Chat us on WhatsApp (optional)
                </a>
              </motion.div>
            )}

            {/* CTA */}
            {payMethod === "paystack" ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePaystack}
                  disabled={isProcessing || paymentSuccess || isOutOfStock}
                  className="w-full rounded-full bg-primary py-4 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {isOutOfStock ? "Out of Stock" : isProcessing ? "Processing…" : paymentSuccess ? "Payment Complete" : "Pay Now"}
                </button>
                <p className="flex items-center justify-center gap-1.5 font-body text-[11px] text-muted-foreground">
                  <ShieldCheck size={12} />
                  Secure payment powered by Paystack
                </p>
              </div>
            ) : (
              <button
                onClick={handlePlaceOrder}
                disabled={!name || !phone || !address || isProcessing || isOutOfStock}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <MessageCircle size={16} />
                {isOutOfStock ? "Out of Stock" : isProcessing ? "Processing…" : "Place Order via WhatsApp"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
