"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-client";

export default function HeroImagesUpload({ images, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image too large. Please use under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(filename, file);
      if (error) {
        alert("Upload failed: " + error.message);
      } else {
        const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
        onChange([...(images || []), data.publicUrl]);
      }
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    onChange(updated);
  };

  const moveImage = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const updated = [...images];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  return (
    <div className="hero-images-manager">
      <div className="hero-images-grid">
        {(images || []).map((src, i) => (
          <div key={i} className="hero-image-tile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Hero ${i + 1}`} />
            <div className="hero-image-overlay">
              <div className="hero-image-position">{i + 1}</div>
              <div className="hero-image-actions">
                {i > 0 && (
                  <button type="button" onClick={() => moveImage(i, i - 1)} aria-label="Move left">‹</button>
                )}
                {i < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(i, i + 1)} aria-label="Move right">›</button>
                )}
                <button type="button" onClick={() => removeImage(i)} aria-label="Remove" className="hero-image-remove">×</button>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="hero-image-add"
          disabled={uploading}
        >
          {uploading ? (
            <span>Uploading…</span>
          ) : (
            <>
              <span className="hero-image-add-plus">+</span>
              <span className="hero-image-add-label">Add photo</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0])}
          style={{ display: "none" }}
        />
      </div>

      <p style={{ fontSize: 11, color: "rgba(232,223,210,0.4)", marginTop: 10, fontStyle: "italic", letterSpacing: "0.04em" }}>
        Tap +/– arrows to reorder. Photos rotate every 5 seconds on the homepage and are swipeable on mobile.
      </p>
    </div>
  );
}
