"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LooksManager({ initialLooks, allProducts }) {
  const [looks, setLooks] = useState(initialLooks);
  const [editing, setEditing] = useState(null);
  const router = useRouter();

  const handleSave = async (look) => {
    const supabase = createClient();
    const payload = {
      title: look.title,
      description: look.description,
      cover_image: look.cover_image,
      product_ids: look.product_ids || [],
      sort_order: look.sort_order ?? 0,
      visible: look.visible,
    };

    if (look.id) {
      const { error } = await supabase.from("looks").update(payload).eq("id", look.id);
      if (error) return alert("Save failed: " + error.message);
      setLooks(looks.map((l) => (l.id === look.id ? { ...l, ...payload } : l)));
    } else {
      const { data, error } = await supabase.from("looks").insert(payload).select().single();
      if (error) return alert("Create failed: " + error.message);
      setLooks([...looks, data]);
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this look?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("looks").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
    setLooks(looks.filter((l) => l.id !== id));
    router.refresh();
  };

  return (
    <>
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">All Looks</h2>
          <button onClick={() => setEditing("new")} className="btn-primary">+ New Look</button>
        </div>

        {looks.length === 0 ? (
          <div className="empty-state">
            No looks yet. Create your first one — pick a few products and a hero photo of you wearing them.
          </div>
        ) : (
          <div className="product-list">
            {looks.map((l) => (
              <div key={l.id} className="product-row">
                <div className="product-row-img" style={{ aspectRatio: "3/4", width: 50, height: 66 }}>
                  {l.cover_image && <img src={l.cover_image} alt="" />}
                </div>
                <div className="product-row-info">
                  <div className="product-row-title">{l.title}</div>
                  <div className="product-row-meta">
                    <span>{(l.product_ids || []).length} products</span>
                    {!l.visible && <span style={{ color: "#c97a6a" }}>Hidden</span>}
                  </div>
                </div>
                <div className="product-row-actions">
                  <button onClick={() => setEditing(l)} className="btn-ghost">Edit</button>
                  <button onClick={() => handleDelete(l.id)} className="btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <LookForm
          look={editing === "new" ? null : editing}
          allProducts={allProducts}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

function LookForm({ look, allProducts, onSave, onCancel }) {
  const [form, setForm] = useState(
    look || {
      title: "",
      description: "",
      cover_image: "",
      product_ids: [],
      sort_order: 0,
      visible: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `look-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(filename, file);
      if (error) {
        alert("Upload failed: " + error.message);
      } else {
        const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
        setForm({ ...form, cover_image: data.publicUrl });
      }
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setUploading(false);
  };

  const toggleProduct = (id) => {
    const current = form.product_ids || [];
    if (current.includes(id)) {
      setForm({ ...form, product_ids: current.filter((pid) => pid !== id) });
    } else {
      setForm({ ...form, product_ids: [...current, id] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  // Group products by category for selection UI
  const groupedProducts = allProducts.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <h2>{look ? "Edit Look" : "New Look"}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label>Cover Photo (you wearing the outfit)</label>
            <div
              className="image-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              style={{ aspectRatio: "3/4", maxWidth: 300, marginInline: "auto", minHeight: "auto" }}
            >
              {form.cover_image ? (
                <div className="image-upload-preview" style={{ aspectRatio: "3/4", maxHeight: "none" }}>
                  <img src={form.cover_image} alt="" />
                  <div className="image-upload-overlay"><span>{uploading ? "Uploading…" : "Click to replace"}</span></div>
                </div>
              ) : (
                <div className="image-upload-empty">
                  <span>{uploading ? "Uploading…" : "Click to upload outfit photo"}</span>
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

          <div className="form-field">
            <label>Look Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              placeholder="Sunset in Canggu"
            />
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="A short note about this look — where, when, the vibe…"
              rows={3}
            />
          </div>

          <div className="form-field">
            <label>Products in this Look ({(form.product_ids || []).length} selected)</label>
            <div className="look-product-picker">
              {allProducts.length === 0 ? (
                <p style={{ padding: 20, color: "rgba(232,223,210,0.4)", fontStyle: "italic", textAlign: "center" }}>
                  Add products first, then you can group them into looks.
                </p>
              ) : (
                Object.keys(groupedProducts).map((cat) => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4a574", marginBottom: 8 }}>
                      {cat}
                    </div>
                    <div className="look-product-grid">
                      {groupedProducts[cat].map((p) => {
                        const selected = (form.product_ids || []).includes(p.id);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleProduct(p.id)}
                            className={`look-product-chip ${selected ? "selected" : ""}`}
                          >
                            <div className="look-product-chip-img">
                              {p.image_url && <img src={p.image_url} alt="" />}
                            </div>
                            <div className="look-product-chip-info">
                              <div className="look-product-chip-title">{p.title}</div>
                              <div className="look-product-chip-brand">{p.brand}</div>
                            </div>
                            {selected && <span className="look-product-chip-check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Sort Order</label>
              <input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <label className="checkbox-label" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                />
                <span>Visible on site</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || uploading}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
