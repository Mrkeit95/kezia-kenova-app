"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function SettingsForm({ initialSettings }) {
  const [form, setForm] = useState({
    location: initialSettings.location || "Bali · Indonesia",
    tagline: initialSettings.tagline || "model · creator · storyteller",
    instagram_url: initialSettings.instagram_url || "https://www.instagram.com/keziaken/",
    tiktok_url: initialSettings.tiktok_url || "https://www.tiktok.com/@keziaken",
    email: initialSettings.email || "keziakenwork@gmail.com",
    hero_image: initialSettings.hero_image || "/kezia.jpeg",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { error } = await supabase.from("settings").update(form).eq("id", 1);
    if (error) {
      alert("Save failed: " + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    }
    setSaving(false);
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Please use under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `hero-${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filename, file, { upsert: false });
      if (error) {
        alert("Upload failed: " + error.message);
      } else {
        const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
        setForm({ ...form, hero_image: data.publicUrl });
      }
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  return (
    <form onSubmit={handleSave}>
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">Hero Image</h2>
        </div>
        <div
          className="image-upload"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{ maxWidth: 320, marginInline: "auto", aspectRatio: "359 / 540", minHeight: "auto" }}
        >
          {form.hero_image ? (
            <div className="image-upload-preview" style={{ aspectRatio: "359 / 540" }}>
              <img src={form.hero_image} alt="Hero" />
              <div className="image-upload-overlay">
                <span>{uploading ? "Uploading…" : "Click or drop to replace"}</span>
              </div>
            </div>
          ) : (
            <div className="image-upload-empty">
              <span>{uploading ? "Uploading…" : "Click to upload hero image"}</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ display: "none" }}
          />
        </div>
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
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
