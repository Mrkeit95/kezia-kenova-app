"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import HeroImagesUpload from "@/components/HeroImagesUpload";

function ImageUploadBlock({ title, description, images, uploading, inputRef, onUpload, onRemove }) {
  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2 className="admin-section-title">{title}</h2>
        <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>
          {images.length} {images.length === 1 ? "image" : "images"}
        </span>
      </div>
      <p style={{ fontSize: 12, color: "rgba(232,223,210,0.4)", fontStyle: "italic", marginBottom: 20, lineHeight: 1.6 }}>
        {description}
      </p>
      <div
        className="brand-upload-area"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onUpload(e.dataTransfer.files); }}
      >
        {uploading ? (
          <span>Uploading…</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, marginBottom: 10, color: "rgba(212,165,116,0.6)" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Click to upload or drag images here</span>
            <span style={{ fontSize: 10, marginTop: 6, color: "rgba(232,223,210,0.3)", letterSpacing: "0.1em" }}>
              From your phone or computer · multiple at once · max 8MB each
            </span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUpload(e.target.files)}
          style={{ display: "none" }}
        />
      </div>
      {images.length > 0 && (
        <div className="brand-images-grid">
          {images.map((src, i) => (
            <div key={i} className="brand-image-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${title} ${i + 1}`} />
              <button type="button" onClick={() => onRemove(i)} className="brand-image-remove" aria-label="Remove">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsForm({ initialSettings }) {
  const [form, setForm] = useState({
    location: initialSettings.location || "Bali · Indonesia",
    tagline: initialSettings.tagline || "model · creator · storyteller",
    instagram_url: initialSettings.instagram_url || "https://www.instagram.com/keziaken/",
    tiktok_url: initialSettings.tiktok_url || "https://www.tiktok.com/@keziaken",
    whatsapp_url: initialSettings.whatsapp_url || "",
    email: initialSettings.email || "keziakenwork@gmail.com",
    hero_image: initialSettings.hero_image || "/kezia.jpeg",
    hero_images: initialSettings.hero_images || (initialSettings.hero_image ? [initialSettings.hero_image] : []),
    about_text: initialSettings.about_text || "",
    brand_images: initialSettings.brand_images || [],
    local_brand_images: initialSettings.local_brand_images || [],
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [brandUploading, setBrandUploading] = useState(false);
  const [localBrandUploading, setLocalBrandUploading] = useState(false);
  const brandInputRef = useRef(null);
  const localBrandInputRef = useRef(null);
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const payload = { ...form, hero_image: form.hero_images?.[0] || form.hero_image };
    const { error } = await supabase.from("settings").update(payload).eq("id", 1);
    if (error) { alert("Save failed: " + error.message); }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); router.refresh(); }
    setSaving(false);
  };

  const uploadImages = async (files, setUploading, prefix) => {
    if (!files || files.length === 0) return [];
    setUploading(true);
    const supabase = createClient();
    const newUrls = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 8 * 1024 * 1024) { alert(`${file.name} is too large — max 8MB`); continue; }
      try {
        const ext = file.name.split(".").pop();
        const filename = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(filename, file);
        if (error) { alert("Upload failed: " + error.message); }
        else {
          const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
          newUrls.push(data.publicUrl);
        }
      } catch (e) { alert("Upload failed: " + e.message); }
    }
    setUploading(false);
    return newUrls;
  };

  const handleBrandUpload = async (files) => {
    const urls = await uploadImages(files, setBrandUploading, "brand");
    if (urls.length > 0) setForm((prev) => ({ ...prev, brand_images: [...prev.brand_images, ...urls] }));
  };

  const handleLocalBrandUpload = async (files) => {
    const urls = await uploadImages(files, setLocalBrandUploading, "local-brand");
    if (urls.length > 0) setForm((prev) => ({ ...prev, local_brand_images: [...prev.local_brand_images, ...urls] }));
  };

  const removeImage = (field, index) => {
    const updated = [...form[field]];
    updated.splice(index, 1);
    setForm({ ...form, [field]: updated });
  };

  return (
    <form onSubmit={handleSave}>

      {/* Hero Photos */}
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

      {/* About Me */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">About Me</h2>
          <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>shown as a tab on your homepage</span>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Your Bio</label>
            <textarea
              value={form.about_text}
              onChange={(e) => setForm({ ...form, about_text: e.target.value })}
              placeholder="Tell your story — who you are, where you're from, what you love…"
              rows={6}
              style={{ lineHeight: 1.7, fontSize: 14 }}
            />
            <p style={{ fontSize: 10, color: "rgba(232,223,210,0.4)", marginTop: 6, letterSpacing: "0.04em" }}>
              Clicking "About Me" in the tab bar opens this as a popup. Blank lines = new paragraph.
            </p>
          </div>
        </div>
      </div>

      {/* High End Brands */}
      <ImageUploadBlock
        title="High End Brands"
        description="Campaign shots, product placements, high end brand collaborations — clicking 'High End Brands' in the tab bar opens these as a lightbox."
        images={form.brand_images}
        uploading={brandUploading}
        inputRef={brandInputRef}
        onUpload={handleBrandUpload}
        onRemove={(i) => removeImage("brand_images", i)}
      />

      {/* Local Brands */}
      <ImageUploadBlock
        title="Local Brands"
        description="Local brand collaborations and partnerships — clicking 'Local Brands' in the tab bar opens these as a lightbox."
        images={form.local_brand_images}
        uploading={localBrandUploading}
        inputRef={localBrandInputRef}
        onUpload={handleLocalBrandUpload}
        onRemove={(i) => removeImage("local_brand_images", i)}
      />

      {/* Profile */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">Profile</h2>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bali · Indonesia" />
          </div>
          <div className="form-field">
            <label>Tagline</label>
            <input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="model · creator · storyteller" />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">Links</h2>
        </div>
        <div className="form-grid">
          <div className="form-field">
            <label>Instagram URL</label>
            <input type="url" value={form.instagram_url} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} placeholder="https://www.instagram.com/..." />
          </div>
          <div className="form-field">
            <label>TikTok URL</label>
            <input type="url" value={form.tiktok_url} onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })} placeholder="https://www.tiktok.com/@..." />
          </div>
          <div className="form-field">
            <label>WhatsApp URL</label>
            <input type="url" value={form.whatsapp_url || ""} onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })} placeholder="https://wa.me/1234567890" />
            <p style={{ fontSize: 10, color: "rgba(232,223,210,0.4)", marginTop: 4 }}>Format: https://wa.me/ followed by your number with country code (no + or spaces)</p>
          </div>
          <div className="form-field">
            <label>Contact Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="hello@example.com" />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
        {saved && <span style={{ fontSize: 12, color: "#d4a574", letterSpacing: "0.16em", textTransform: "uppercase" }}>✓ Saved</span>}
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button>
      </div>
    </form>
  );
}
