import { createFileRoute } from "@tanstack/react-router";
import { useProducts, useOrders, formatPrice } from "@/lib/admin-hooks";
import { Package, ShoppingCart, CreditCard, Truck, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { products, loading: pLoading } = useProducts();
  const { orders, loading: oLoading } = useOrders();

  const paystackOrders = orders.filter((o) => o.payment_type === "paystack");
  const deliveryOrders = orders.filter((o) => o.payment_type === "delivery");

  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-500" },
    { label: "Paystack Orders", value: paystackOrders.length, icon: CreditCard, color: "text-green-500" },
    { label: "Delivery Orders", value: deliveryOrders.length, icon: Truck, color: "text-orange-500" },
  ];

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {pLoading || oLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-8 w-12 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="font-body text-xs font-medium text-muted-foreground">{s.label}</p>
                  <s.icon size={18} className={s.color} />
                </div>
                <p className="mt-2 font-display text-3xl font-bold text-foreground">{s.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="font-body text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left font-body text-xs font-medium text-muted-foreground">Name</th>
                <th className="px-5 py-3 text-left font-body text-xs font-medium text-muted-foreground">Product</th>
                <th className="px-5 py-3 text-left font-body text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-5 py-3 text-left font-body text-xs font-medium text-muted-foreground">Type</th>
                <th className="px-5 py-3 text-left font-body text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-5 py-3 text-left font-body text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {oLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3">
                        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center font-body text-sm text-muted-foreground">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border transition-colors hover:bg-accent/50">
                    <td className="px-5 py-3 font-body text-sm text-foreground">{o.customer_name || "—"}</td>
                    <td className="px-5 py-3 font-body text-sm text-foreground">{o.product_name}</td>
                    <td className="px-5 py-3 font-body text-sm font-medium text-foreground">{formatPrice(o.amount)}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-xs font-medium ${
                        o.payment_type === "paystack"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      }`}>
                        {o.payment_type === "paystack" ? "Card" : "Delivery"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-3 font-body text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          to="/admin/products"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Package size={18} className="text-primary" />
          </div>
          <span className="font-body text-sm font-medium text-foreground">Add Product</span>
        </Link>
        <Link
          to="/admin/orders"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
            <ShoppingCart size={18} className="text-blue-500" />
          </div>
          <span className="font-body text-sm font-medium text-foreground">View Orders</span>
        </Link>
        <Link
          to="/admin/content"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <FileText size={18} className="text-orange-500" />
          </div>
          <span className="font-body text-sm font-medium text-foreground">Edit Website</span>
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 font-body text-xs font-medium capitalize ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
