import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useSiteContent } from "@/lib/store-hooks";

interface HeaderProps {
  /** When true, header always uses solid styling (for pages without a hero). */
  solid?: boolean;
}

export function Header({ solid = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { content } = useSiteContent();
  const logoUrl = content.site_logo_url;
  const siteName = content.site_name || "One Emporium";
  const [first, ...rest] = siteName.split(" ");
  const restText = rest.join(" ");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    setDark((d) => !d);
    document.documentElement.classList.toggle("dark");
  };

  // Treat as "scrolled" (solid) when prop is true OR user has scrolled
  const isSolid = solid || scrolled;

  const navLinks = [
    { label: "Shop", href: "/#products" },
    { label: "About", href: "/#why-us" },
    { label: "Reviews", href: "/#testimonials" },
    { label: "Contact", href: "/#footer" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isSolid
          ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm py-2"
          : "bg-transparent py-3"
      }`}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link
          to="/"
          className={`flex items-center gap-2 whitespace-nowrap font-display text-xl font-semibold tracking-tight md:text-2xl transition-all duration-300 ${
            isSolid
              ? "text-foreground"
              : "text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]"
          }`}
          style={isSolid ? {} : { textShadow: "0 1px 8px rgba(0,0,0,0.35)" }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} className="h-8 w-auto md:h-10 object-contain" />
          ) : (
            <>
              {first}
              {restText && (
                <span className={isSolid ? "text-primary" : "text-white/90"}> {restText}</span>
              )}
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`font-body text-sm font-medium tracking-wide transition-colors ${
                isSolid
                  ? "text-muted-foreground hover:text-primary"
                  : "text-white/80 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            className={`rounded-full p-2 transition-colors ${
              isSolid
                ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className={`relative rounded-full p-2 transition-colors ${
              isSolid
                ? "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
          </button>
          <button
            className={`rounded-full p-2 md:hidden ${
              isSolid ? "text-muted-foreground" : "text-white/80"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-card/95 backdrop-blur-md md:hidden"
          >
            <nav className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
