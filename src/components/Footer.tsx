import { Instagram, Facebook, Twitter, MessageCircle, Mail, Phone } from "lucide-react";
import { useSiteContent } from "@/lib/store-hooks";

const YEAR = new Date().getFullYear();

export function Footer() {
  const { content } = useSiteContent();

  const siteName = content.site_name || "One Emporium";
  const phone = content.footer_phone || "+234 801 234 5678";
  const email = content.footer_email || "hello@oneemporium.ng";
  const whatsapp = content.footer_whatsapp || "2348012345678";
  const description =
    content.footer_description ||
    "Premium fashion bags for the modern Nigerian woman. Quality, elegance, and style — delivered to your doorstep.";
  const [first, ...rest] = siteName.split(" ");
  const restText = rest.join(" ");

  return (
    <footer id="footer" className="border-t border-border bg-card py-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl font-semibold text-card-foreground">
              {first}
              {restText && <span className="text-primary"> {restText}</span>}
            </h3>
            <p className="mt-3 font-body text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {description}
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-2">
              {["Shop", "About", "Reviews", "Contact"].map((l) => (
                <a
                  key={l}
                  href={`/#${l.toLowerCase() === "shop" ? "products" : l.toLowerCase() === "about" ? "why-us" : l.toLowerCase() === "reviews" ? "testimonials" : "footer"}`}
                  className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {l}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-4 font-body text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <MessageCircle size={16} />
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone size={16} />
                <span>{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail size={16} />
                <span>{email}</span>
              </a>
            </div>
            <div className="mt-6 flex gap-3">
              {[
                { Icon: Instagram, url: content.footer_instagram },
                { Icon: Facebook, url: content.footer_facebook },
                { Icon: Twitter, url: content.footer_twitter },
              ].map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url || "#"}
                  target={url ? "_blank" : undefined}
                  rel={url ? "noopener noreferrer" : undefined}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © {YEAR} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
