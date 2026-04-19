import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSiteContent } from "@/lib/admin-hooks";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const { content, loading, update } = useSiteContent();
  const [activeTab, setActiveTab] = useState<"hero" | "footer" | "global">("hero");
  const [saving, setSaving] = useState(false);

  const handleSave = async (key: string, value: string) => {
    setSaving(true);
    await update(key, value);
    setSaving(false);
    toast.success("Saved");
  };

  const tabs = [
    { id: "hero" as const, label: "Hero Section" },
    { id: "footer" as const, label: "Footer" },
    { id: "global" as const, label: "Global Settings" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-foreground">Content Management</h2>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 rounded-lg px-4 py-2 font-body text-sm font-medium transition-all ${
              activeTab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        {activeTab === "hero" && (
          <div className="space-y-4">
            <ContentField label="Hero Title" contentKey="hero_title" value={content.hero_title || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Hero Subtitle" contentKey="hero_subtitle" value={content.hero_subtitle || ""} onSave={handleSave} saving={saving} textarea />
            <ContentField label="Button Text" contentKey="hero_button_text" value={content.hero_button_text || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Badge Text" contentKey="hero_badge_text" value={content.hero_badge_text || ""} onSave={handleSave} saving={saving} />
          </div>
        )}

        {activeTab === "footer" && (
          <div className="space-y-4">
            <ContentField label="Footer Description" contentKey="footer_description" value={content.footer_description || ""} onSave={handleSave} saving={saving} textarea />
            <ContentField label="Phone Number" contentKey="footer_phone" value={content.footer_phone || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Email" contentKey="footer_email" value={content.footer_email || ""} onSave={handleSave} saving={saving} />
            <ContentField label="WhatsApp Number" contentKey="footer_whatsapp" value={content.footer_whatsapp || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Instagram URL" contentKey="footer_instagram" value={content.footer_instagram || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Facebook URL" contentKey="footer_facebook" value={content.footer_facebook || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Twitter URL" contentKey="footer_twitter" value={content.footer_twitter || ""} onSave={handleSave} saving={saving} />
          </div>
        )}

        {activeTab === "global" && (
          <div className="space-y-4">
            <ContentField label="Website Name" contentKey="site_name" value={content.site_name || ""} onSave={handleSave} saving={saving} />
            <ContentField label="Meta Description (SEO & link previews)" contentKey="meta_description" value={content.meta_description || ""} onSave={handleSave} saving={saving} textarea />
            <ContentField label="WhatsApp Order Number" contentKey="whatsapp_order_number" value={content.whatsapp_order_number || ""} onSave={handleSave} saving={saving} />
            <p className="font-body text-xs text-muted-foreground">This number receives Pay on Delivery order messages via WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentField({
  label,
  contentKey,
  value: initialValue,
  onSave,
  saving,
  textarea,
}: {
  label: string;
  contentKey: string;
  value: string;
  onSave: (key: string, value: string) => Promise<void>;
  saving: boolean;
  textarea?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const changed = value !== initialValue;

  const InputComp = textarea ? "textarea" : "input";

  return (
    <div>
      <label className="mb-1.5 block font-body text-xs font-medium text-muted-foreground">{label}</label>
      <div className="flex gap-2">
        <InputComp
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value)}
          rows={textarea ? 3 : undefined}
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 font-body text-sm text-foreground resize-none focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {changed && (
          <button
            onClick={() => onSave(contentKey, value)}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2.5 text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            <Save size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
