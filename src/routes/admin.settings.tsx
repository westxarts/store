import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSiteContent } from "@/lib/admin-hooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, ShieldCheck, Image as ImageIcon, Upload, Trash2, Globe, Share2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { content, loading, update } = useSiteContent();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-foreground">Settings</h2>

      {/* Brand / Logo */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ImageIcon size={18} className="text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Brand Logo</h3>
        </div>
        <ImageUpload
          contentKey="site_logo_url"
          value={content.site_logo_url || ""}
          onSave={update}
          description="Upload your brand logo (PNG, JPG, SVG, or WEBP). It will appear in the website header."
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          allowedTypes={["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"]}
          fileNamePrefix="logo"
        />
      </div>

      {/* Favicon */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Globe size={18} className="text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Favicon</h3>
        </div>
        <ImageUpload
          contentKey="site_favicon_url"
          value={content.site_favicon_url || ""}
          onSave={update}
          description="Upload a favicon (PNG, ICO, or SVG). Recommended size: 32x32 or 64x64. Shown in the browser tab."
          accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
          allowedTypes={["image/png", "image/x-icon", "image/vnd.microsoft.icon", "image/svg+xml"]}
          fileNamePrefix="favicon"
        />
      </div>

      {/* Open Graph Image */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Share2 size={18} className="text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Social Share Image</h3>
        </div>
        <ImageUpload
          contentKey="og_image_url"
          value={content.og_image_url || ""}
          onSave={update}
          description="Upload an Open Graph image (recommended 1200x630). Shown when your link is shared on WhatsApp, Facebook, X, etc."
          accept="image/png,image/jpeg,image/webp"
          allowedTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
          fileNamePrefix="og-image"
        />
      </div>

      {/* Paystack Settings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={18} className="text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Payment Settings</h3>
        </div>
        <SettingsField
          label="Paystack Public Key"
          description="This key is used to initialize Paystack payments on the storefront."
          contentKey="paystack_public_key"
          value={content.paystack_public_key || ""}
          onSave={update}
        />
      </div>

      {/* WhatsApp Settings */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Pay on Delivery</h3>
        <SettingsField
          label="WhatsApp Number"
          description="When a customer places a Pay on Delivery order, they will be redirected to WhatsApp with this number."
          contentKey="whatsapp_order_number"
          value={content.whatsapp_order_number || ""}
          onSave={update}
        />
      </div>
    </div>
  );
}

function ImageUpload({
  contentKey,
  value,
  onSave,
  description,
  accept,
  allowedTypes,
  fileNamePrefix,
}: {
  contentKey: string;
  value: string;
  onSave: (key: string, value: string) => Promise<void>;
  description: string;
  accept: string;
  allowedTypes: string[];
  fileNamePrefix: string;
}) {
  const [preview, setPreview] = useState<string>(value);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!allowedTypes.includes(f.type)) {
      toast.error("Unsupported file type");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${fileNamePrefix}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      await onSave(contentKey, data.publicUrl);
      setFile(null);
      setPreview(data.publicUrl);
      toast.success("Saved");
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    setPreview("");
    setFile(null);
    await onSave(contentKey, "");
    toast.success("Removed");
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-xs text-muted-foreground">{description}</p>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-contain p-2" />
          ) : (
            <ImageIcon size={28} className="text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm font-medium text-foreground transition-colors hover:bg-accent">
            <Upload size={14} />
            Choose file
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {file && (
              <button
                onClick={handleSave}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                <Save size={14} />
                {uploading ? "Uploading…" : "Save"}
              </button>
            )}
            {preview && !file && (
              <button
                onClick={handleRemove}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 font-body text-sm font-medium text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsField({
  label,
  description,
  contentKey,
  value: initialValue,
  onSave,
}: {
  label: string;
  description: string;
  contentKey: string;
  value: string;
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const changed = value !== initialValue;

  const handleSave = async () => {
    setSaving(true);
    await onSave(contentKey, value);
    setSaving(false);
    toast.success("Setting updated");
  };

  return (
    <div>
      <label className="mb-1 block font-body text-sm font-medium text-foreground">{label}</label>
      <p className="mb-3 font-body text-xs text-muted-foreground">{description}</p>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {changed && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-body text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save"}
          </button>
        )}
      </div>
    </div>
  );
}
