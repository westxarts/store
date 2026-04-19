import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useProducts, formatPrice } from "@/lib/admin-hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Copy, X, Upload, Palette } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

interface ColorOption {
  name: string;
  hex: string;
}

interface ProductForm {
  name: string;
  price: string;
  description: string;
  full_description: string;
  category: string;
  image_url: string;
  images: string[];
  in_stock: boolean;
  colors: ColorOption[];
  track_stock: boolean;
  stock_quantity: string;
}

const emptyForm: ProductForm = {
  name: "",
  price: "",
  description: "",
  full_description: "",
  category: "",
  image_url: "",
  images: [],
  in_stock: true,
  colors: [],
  track_stock: false,
  stock_quantity: "0",
};

function AdminProducts() {
  const { products, loading, refetch } = useProducts();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Color form state
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: typeof products[0]) => {
    const colors: ColorOption[] = Array.isArray(p.colors)
      ? (p.colors as unknown as ColorOption[])
      : [];
    setForm({
      name: p.name,
      price: String(p.price),
      description: p.description,
      full_description: p.full_description,
      category: p.category,
      image_url: p.image_url,
      images: p.images || [],
      in_stock: p.in_stock,
      colors,
      track_stock: p.track_stock,
      stock_quantity: String(p.stock_quantity),
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDuplicate = async (p: typeof products[0]) => {
    const { error } = await supabase.from("products").insert({
      name: `${p.name} (Copy)`,
      price: p.price,
      description: p.description,
      full_description: p.full_description,
      image_url: p.image_url,
      images: p.images,
      category: p.category,
      in_stock: p.in_stock,
      sort_order: p.sort_order + 1,
      colors: p.colors,
      stock_quantity: p.stock_quantity,
      track_stock: p.track_stock,
    });
    if (error) { toast.error("Failed to duplicate"); return; }
    toast.success("Product duplicated");
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Product deleted");
    refetch();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file);
      if (error) {
        toast.error(`Upload failed: ${file.name}`);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);
      newImages.push(urlData.publicUrl);
    }

    setForm((f) => {
      const updatedImages = [...f.images, ...newImages];
      return {
        ...f,
        images: updatedImages,
        image_url: f.image_url || updatedImages[0] || "",
      };
    });
    setUploading(false);
    toast.success(`${newImages.length} image(s) uploaded`);
  };

  const removeImage = (idx: number) => {
    setForm((f) => {
      const updated = f.images.filter((_, i) => i !== idx);
      return {
        ...f,
        images: updated,
        image_url: f.image_url === f.images[idx] ? (updated[0] || "") : f.image_url,
      };
    });
  };

  const setPrimaryImage = (url: string) => {
    setForm((f) => ({ ...f, image_url: url }));
  };

  const addColor = () => {
    if (!newColorName.trim()) return;
    if (editingColorIdx !== null) {
      setForm((f) => {
        const updated = [...f.colors];
        updated[editingColorIdx] = { name: newColorName.trim(), hex: newColorHex };
        return { ...f, colors: updated };
      });
      setEditingColorIdx(null);
    } else {
      setForm((f) => ({
        ...f,
        colors: [...f.colors, { name: newColorName.trim(), hex: newColorHex }],
      }));
    }
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const editColor = (idx: number) => {
    const c = form.colors[idx];
    setNewColorName(c.name);
    setNewColorHex(c.hex);
    setEditingColorIdx(idx);
  };

  const removeColor = (idx: number) => {
    setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      price: parseInt(form.price),
      description: form.description,
      full_description: form.full_description,
      category: form.category,
      image_url: form.image_url || form.images[0] || "",
      images: form.images,
      in_stock: form.in_stock,
      colors: JSON.parse(JSON.stringify(form.colors)),
      track_stock: form.track_stock,
      stock_quantity: parseInt(form.stock_quantity) || 0,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
      toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
      toast.success("Product added");
    }
    setSaving(false);
    setShowForm(false);
    refetch();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">Products</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.97]"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 font-body text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4">
              <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const colors = Array.isArray(p.colors) ? (p.colors as unknown as ColorOption[]) : [];
            return (
              <div key={p.id} className="group rounded-2xl border border-border bg-card overflow-hidden transition-all hover:shadow-md">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="aspect-square w-full object-cover" />
                ) : (
                  <div className="aspect-square w-full bg-muted flex items-center justify-center">
                    <span className="font-body text-xs text-muted-foreground">No image</span>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display text-base font-semibold text-foreground">{p.name}</h3>
                  <p className="font-body text-sm font-bold text-primary">{formatPrice(p.price)}</p>
                  {colors.length > 0 && (
                    <div className="mt-2 flex gap-1">
                      {colors.map((c, i) => (
                        <span key={i} className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} title={c.name} />
                      ))}
                    </div>
                  )}
                  {p.track_stock && (
                    <p className="mt-1 font-body text-xs text-muted-foreground">
                      Stock: {p.stock_quantity}
                    </p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleDuplicate(p)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-body text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <Copy size={12} /> Duplicate
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 font-body text-xs text-destructive transition-colors hover:bg-destructive/10">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Images Section */}
              <div>
                <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">Product Images</label>
                {form.images.length > 0 ? (
                  <div className="space-y-3">
                    {/* Primary image */}
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <img src={form.image_url || form.images[0]} alt="" className="h-full w-full object-cover" />
                      <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 font-body text-[10px] font-semibold text-primary-foreground">Primary</span>
                    </div>
                    {/* Thumbnails */}
                    <div className="grid grid-cols-4 gap-2">
                      {form.images.map((img, idx) => (
                        <div key={idx} className={`relative aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${form.image_url === img ? "border-primary" : "border-transparent hover:border-primary/30"}`}>
                          <img src={img} alt="" className="h-full w-full object-cover" onClick={() => setPrimaryImage(img)} />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-0.5 right-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {/* Add more */}
                      <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30">
                        <Plus size={16} className="text-muted-foreground" />
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary/30">
                    <div className="text-center">
                      <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                      <span className="font-body text-xs text-muted-foreground">
                        {uploading ? "Uploading…" : "Click to upload images"}
                      </span>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                )}

                {/* Colors Section */}
                <div className="mt-5">
                  <label className="mb-1.5 flex items-center gap-1.5 font-body text-xs font-medium text-muted-foreground">
                    <Palette size={12} />
                    Color Options
                  </label>
                  {form.colors.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {form.colors.map((c, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 rounded-full border border-border py-1 pl-1.5 pr-2.5">
                          <span className="h-5 w-5 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                          <span className="font-body text-xs text-foreground">{c.name}</span>
                          <button onClick={() => editColor(idx)} className="ml-1 text-muted-foreground hover:text-foreground">
                            <Pencil size={10} />
                          </button>
                          <button onClick={() => removeColor(idx)} className="text-muted-foreground hover:text-destructive">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-lg border border-border p-0.5"
                    />
                    <input
                      type="text"
                      placeholder="Color name"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addColor()}
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={addColor}
                      className="rounded-lg bg-accent px-3 py-2 font-body text-xs font-medium text-foreground hover:bg-accent/80"
                    >
                      {editingColorIdx !== null ? "Update" : "Add"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-3">
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">Product Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">Price (₦)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">Short Description</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">Full Description</label>
                  <textarea
                    value={form.full_description}
                    onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground resize-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Stock Section */}
                <div className="rounded-xl border border-border p-3 space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.track_stock}
                      onChange={(e) => setForm((f) => ({ ...f, track_stock: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="font-body text-sm text-foreground">Track stock quantity</span>
                  </label>
                  {form.track_stock && (
                    <div>
                      <label className="mb-1 block font-body text-xs font-medium text-muted-foreground">Quantity in Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock_quantity}
                        onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                  {!form.track_stock && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.in_stock}
                        onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="font-body text-sm text-foreground">In Stock</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-border px-5 py-2.5 font-body text-sm font-medium text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
