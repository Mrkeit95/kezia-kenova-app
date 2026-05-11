"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import HeroImagesUpload from "@/components/HeroImagesUpload";

export default function SettingsForm({ initialSettings }) {
  const [form, setForm] = useState({
    location: initialSettings.location || "Bali · Indonesia",
    tagline: initialSettings.tagline || "model · creator · storyteller",
    instagram_url: initialSettings.instagram_url || "https://www.instagram.com/keziaken/",
    tiktok_url: initialSettings.tiktok_url || "https://www.tiktok.com/@keziaken",
    email: initialSettings.email || "keziakenwork@gmail.com",
    hero_image: initialSettings.hero_image || "/kezia.jpeg",
    hero_images: initialSettings.hero_images || (initialSettings.hero_image ? [initialSettings.hero_image] : []),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    // Keep hero_image in sync for backwards compatibility (first hero image)
    const payload = {
      ...form,
      hero_image: form.hero_images?.[0] || form.hero_image,
    };
    const { error } = await supabase.from("settings").update(payload).eq("id", 1);
    if (error) {
      alert("Save failed: " + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    }
    setSaving(false);
  };

  return (
    <form onSubmit={handleSave}>
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">Hero Photos</h2>
          <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>
            {form.hero_images.length} {form.hero_images.length === 1 ? "photo" : "photos"}
          </span>
        </div>
        <HeroImagesUpload
          images={form.hero_images}
          onChange={(images) => setForm({ ...form, hero_images: images })}
        />
      </div>

      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">Profile</h2>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Bali · Indonesia"
            />
          </div>

          <div className="form-field">
            <label>Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="model · creator · storyteller"
            />
          </div>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">Links</h2>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Instagram URL</label>
            <input
              type="url"
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              placeholder="https://www.instagram.com/..."
            />
          </div>

          <div className="form-field">
            <label>TikTok URL</label>
            <input
              type="url"
              value={form.tiktok_url}
              onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
              placeholder="https://www.tiktok.com/@..."
            />
          </div>

          <div className="form-field">
            <label>Contact Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="hello@example.com"
            />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
        {saved && (
          <span style={{ fontSize: 12, color: "#d4a574", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            ✓ Saved
          </span>
        )}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
