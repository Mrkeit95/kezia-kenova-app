"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const CATEGORIES = ["Jewellery", "Makeup", "Fashion", "Skincare"];

export default function ProductsManager({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState(null);
  const router = useRouter();

  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const handleSave = async (product) => {
    const supabase = createClient();
    const payload = {
      title: product.title,
      brand: product.brand,
      category: product.category,
      price: product.price,
      description: product.description,
      affiliate_url: product.affiliate_url,
      image_url: product.image_url,
      sort_order: product.sort_order,
      visible: product.visible,
      featured: product.featured,
    };

    if (product.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) return alert("Save failed: " + error.message);
      setProducts(products.map((p) => (p.id === product.id ? { ...p, ...payload } : p)));
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert({ ...payload, sort_order: payload.sort_order ?? 0, visible: true })
        .select()
        .single();
      if (error) return alert("Create failed: " + error.message);
      setProducts([...products, data]);
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
    setProducts(products.filter((p) => p.id !== id));
    router.refresh();
  };

  const toggleFeatured = async (product) => {
    const supabase = createClient();
    const newVal = !product.featured;
    const { error } = await supabase
      .from("products")
      .update({ featured: newVal })
      .eq("id", product.id);
    if (error) return alert("Failed: " + error.message);
    setProducts(products.map((p) => (p.id === product.id ? { ...p, featured: newVal } : p)));
    router.refresh();
  };

  const featuredCount = products.filter((p) => p.featured).length;

  return (
    <>
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">All Products</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>
              {featuredCount} in best sellers · {products.length} total
            </span>
            <button onClick={() => setEditing("new")} className="btn-primary">
              + Add Product
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            No products yet. Click "Add Product" to get started.
          </div>
        ) : (
          CATEGORIES.map((cat) =>
            grouped[cat] ? (
              <div key={cat} style={{ marginBottom: 32 }}>
                <h3
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: 18,
                    color: "#d4a574",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    marginBottom: 14,
                  }}
                >
                  {cat}
                </h3>
                <div className="product-list">
                  {grouped[cat].map((p) => (
                    <div key={p.id} className="product-row">
                      <div className="product-row-img">
                        {p.image_url && <img src={p.image_url} alt="" />}
                      </div>
                      <div className="product-row-info">
                        <div className="product-row-title">
                          {p.title}
                          {p.featured && <span className="featured-badge">★ Best Seller</span>}
                        </div>
                        <div className="product-row-meta">
                          <span>{p.brand}</span>
                          {p.price && <span style={{ color: "#d4a574" }}>{p.price}</span>}
                          <span className="tag">{p.category}</span>
                          {!p.visible && <span style={{ color: "#c97a6a" }}>Hidden</span>}
                        </div>
                      </div>
                      <div className="product-row-actions">
                        <button
                          onClick={() => toggleFeatured(p)}
                          className={p.featured ? "btn-primary" : "btn-ghost"}
                          title={p.featured ? "Remove from Best Sellers" : "Add to Best Sellers"}
                        >
                          {p.featured ? "★" : "☆"}
                        </button>
                        <button onClick={() => setEditing(p)} className="btn-ghost">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="btn-danger">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState(
    product || {
      title: "",
      brand: "",
      category: "Jewellery",
      price: "",
      description: "",
      affiliate_url: "",
      image_url: "",
      sort_order: 0,
      visible: true,
      featured: false,
    }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image is too large. Please use under 5MB.");
      return;
    }

    setUploadError("");
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filename, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setUploadError("Upload failed: " + uploadError.message);
        setUploading(false);
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
      setForm({ ...form, image_url: data.publicUrl });
    } catch (e) {
      setUploadError("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit} className="form-grid">

          {/* Image upload area */}
          <div className="form-field">
            <label>Product Image</label>
            <div
              className="image-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {form.image_url ? (
                <div className="image-upload-preview">
                  <img src={form.image_url} alt="" />
                  <div className="image-upload-overlay">
                    <span>Click or drop to replace</span>
                  </div>
                </div>
              ) : (
                <div className="image-upload-empty">
                  {uploading ? (
                    <span>Uploading…</span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32, marginBottom: 12 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <span>Click to upload or drag image here</span>
                      <span style={{ fontSize: 10, marginTop: 6, color: "rgba(232,223,210,0.35)" }}>
                        From your phone or computer · max 5MB
                      </span>
                    </>
                  )}
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
            {uploadError && <p style={{ fontSize: 11, color: "#c97a6a", marginTop: 6 }}>{uploadError}</p>}
            <details style={{ marginTop: 8 }}>
              <summary style={{ fontSize: 10, color: "rgba(232,223,210,0.4)", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Or paste an image URL
              </summary>
              <input
                type="url"
                value={form.image_url || ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                style={{ marginTop: 8 }}
              />
            </details>
          </div>

          <div className="form-field">
            <label>Product Name</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Gold Chain Necklace"
            />
          </div>

          <div className="form-field">
            <label>Brand</label>
            <input
              type="text"
              value={form.brand || ""}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Mejuri"
            />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Price</label>
              <input
                type="text"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="$120"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Why I love this product — what makes it special, how I style or use it..."
              rows={4}
            />
          </div>

          <div className="form-field">
            <label>Affiliate Link</label>
            <input
              type="url"
              value={form.affiliate_url || ""}
              onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-field">
            <label>Sort Order (lower = first)</label>
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              />
              <span>Visible on site</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.featured || false}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <span>★ Best Seller</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || uploading}>
              {saving ? "Saving…" : uploading ? "Uploading…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
