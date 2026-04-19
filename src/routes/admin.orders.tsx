import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useOrders, formatPrice } from "@/lib/admin-hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, X, CheckCircle, Truck, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const { orders, loading, refetch } = useOrders();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.product_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || o.payment_type === filterType;
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { toast.error("Failed to update"); return; }
    toast.success(`Order ${status}`);
    refetch();
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Order deleted");
    setSelectedOrder(null);
    refetch();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-foreground">Orders</h2>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="paystack">Paystack</option>
          <option value="delivery">Delivery</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-xl border border-border bg-card px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Order ID</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Product</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Qty</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Amount</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-body text-xs font-medium text-muted-foreground">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 w-14 animate-pulse rounded bg-muted" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center font-body text-sm text-muted-foreground">No orders found</td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-accent/50"
                >
                  <td className="px-4 py-3 font-body text-xs text-muted-foreground">{o.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 font-body text-sm text-foreground">{o.customer_name || "—"}</td>
                  <td className="px-4 py-3 font-body text-sm text-foreground">{o.product_name}</td>
                  <td className="px-4 py-3 font-body text-sm text-foreground">{o.quantity}</td>
                  <td className="px-4 py-3 font-body text-sm font-medium text-foreground">{formatPrice(o.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.payment_type === "paystack" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                    }`}>{o.payment_type === "paystack" ? "Card" : "Delivery"}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 font-body text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Panel */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelectedOrder(null)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-foreground">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <p className="mb-1 font-body text-xs text-muted-foreground">Customer</p>
                <p className="font-body text-sm font-medium text-foreground">{selectedOrder.customer_name || "—"}</p>
                <p className="font-body text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                <p className="font-body text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                <p className="mt-1 font-body text-sm text-muted-foreground">{selectedOrder.customer_address}</p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="mb-1 font-body text-xs text-muted-foreground">Order</p>
                <p className="font-body text-sm font-medium text-foreground">{selectedOrder.product_name}</p>
                <p className="font-body text-sm text-muted-foreground">Qty: {selectedOrder.quantity}</p>
                <p className="font-body text-lg font-bold text-primary">{formatPrice(selectedOrder.amount)}</p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <p className="mb-1 font-body text-xs text-muted-foreground">Payment</p>
                <p className="font-body text-sm font-medium text-foreground capitalize">{selectedOrder.payment_type}</p>
                {selectedOrder.payment_ref && (
                  <p className="font-body text-xs text-muted-foreground">Ref: {selectedOrder.payment_ref}</p>
                )}
                <div className="mt-2"><StatusBadge status={selectedOrder.status} /></div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                {selectedOrder.status !== "confirmed" && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, "confirmed")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    <CheckCircle size={16} /> Mark as Confirmed
                  </button>
                )}
                {selectedOrder.status !== "delivered" && (
                  <button
                    onClick={() => updateStatus(selectedOrder.id, "delivered")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-green-600"
                  >
                    <Truck size={16} /> Mark as Delivered
                  </button>
                )}
                <button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 px-4 py-2.5 font-body text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} /> Delete Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
