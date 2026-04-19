import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getAdminSession, signOutAdmin } from "@/lib/admin-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — One Emporium" }] }),
  component: AdminLayout,
});

const navItems = [
  { label: "Dashboard", to: "/admin" as const, icon: LayoutDashboard },
  { label: "Products", to: "/admin/products" as const, icon: Package },
  { label: "Orders", to: "/admin/orders" as const, icon: ShoppingCart },
  { label: "Content", to: "/admin/content" as const, icon: FileText },
  { label: "Settings", to: "/admin/settings" as const, icon: Settings },
];

function AdminLayout() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't check auth on the login page
    if (location.pathname === "/admin/login") {
      setAuthed(true); // Let the login page render
      return;
    }
    
    getAdminSession().then((s) => {
      if (!s) {
        navigate({ to: "/admin/login" });
      } else {
        setAuthed(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate({ to: "/admin/login" });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // If on login page, just render outlet
  if (location.pathname === "/admin/login") {
    return <Outlet />;
  }

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const handleLogout = async () => {
    await signOutAdmin();
    toast.success("Logged out");
    navigate({ to: "/admin/login" });
  };

  const currentPage = navItems.find((n) => location.pathname === n.to)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <span className="font-display text-base font-semibold tracking-tight text-foreground whitespace-nowrap truncate">
              One<span className="text-primary"> Emporium</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ChevronLeft size={16} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 px-2 py-3">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ExternalLink size={18} />
            {!collapsed && <span>View Website</span>}
          </a>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-display text-base font-semibold tracking-tight text-foreground whitespace-nowrap truncate">
                One<span className="text-primary"> Emporium</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="shrink-0 text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <nav className="px-2 py-3">
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-border p-2 space-y-1">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ExternalLink size={18} />
                <span>View Website</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-body text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-1.5 text-muted-foreground md:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="font-display text-lg font-semibold text-foreground">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-body text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <ExternalLink size={14} />
              View Website
            </a>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="font-body text-xs font-bold text-primary">A</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
