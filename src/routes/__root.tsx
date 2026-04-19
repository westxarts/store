import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "One Emporium" },
      { name: "description", content: "Premium fashion bags for the modern Nigerian woman." },
      { property: "og:title", content: "One Emporium" },
      { property: "og:description", content: "Premium fashion bags for the modern Nigerian woman." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "One Emporium" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Dynamically applies favicon, OG image, title and meta description from
 * site_content (admin-controlled). This runs on the client and overrides
 * the static defaults set in head() above.
 */
function DynamicMeta() {
  const [content, setContent] = useState<Record<string, string>>({});
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    supabase.from("site_content").select("*").then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((item) => { map[item.key] = item.value; });
      setContent(map);
    });
  }, []);

  useEffect(() => {
    const siteName = content.site_name || "One Emporium";
    const description = content.meta_description || "Premium fashion bags for the modern Nigerian woman.";
    const faviconUrl = content.site_favicon_url;
    const ogImage = content.og_image_url;

    // Only override the title on non-route-specific pages (root). Routes set their own.
    if (pathname === "/") {
      document.title = siteName;
    }

    const setMeta = (selector: string, attr: string, value: string) => {
      let tag = document.head.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement("meta");
        const [, key, val] = selector.match(/\[(name|property)="([^"]+)"\]/) || [];
        if (key && val) tag.setAttribute(key, val);
        document.head.appendChild(tag);
      }
      tag.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:site_name"]', "content", siteName);

    if (ogImage) {
      setMeta('meta[property="og:image"]', "content", ogImage);
      setMeta('meta[name="twitter:image"]', "content", ogImage);
    }

    if (faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [content, pathname]);

  return null;
}

function RootComponent() {
  return (
    <>
      <DynamicMeta />
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  );
}
