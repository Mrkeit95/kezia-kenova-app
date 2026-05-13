"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function SectionsManager({ initialSections, allProducts }) {
  const sorted = [...initialSections].sort((a, b) => a.sort_order - b.sort_order);
  const [sections, setSections] = useState(sorted);
  const [editing, setEditing] = useState(null);
  const [reordering, setReordering] = useState(false);
  const router = useRouter();

  const handleSave = async (section) => {
    const supabase = createClient();
    const payload = {
      title: section.title,
      slug: section.slug || slugify(section.title),
      subtitle: section.subtitle,
      product_ids: section.product_ids || [],
      sort_order: section.sort_order ?? 0,
      visible: section.visible,
    };

    if (section.id) {
      const { error } = await supabase.from("sections").update(payload).eq("id", section.id);
      if (error) return alert("Save failed: " + error.message);
      setSections(sections.map((s) => (s.id === section.id ? { ...s, ...payload } : s)));
    } else {
      const { data, error } = await supabase.from("sections").insert(payload).select().single();
      if (error) return alert("Create failed: " + error.message);
      setSections([...sections, data]);
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this section? Products won't be deleted, just this grouping.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("sections").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
    setSections(sections.filter((s) => s.id !== id));
    router.refresh();
  };

  const toggleVisible = async (section) => {
    const supabase = createClient();
    const newVal = !section.visible;
    const { error } = await supabase.from("sections").update({ visible: newVal }).eq("id", section.id);
    if (error) return alert("Failed: " + error.message);
    setSections(sections.map((s) => (s.id === section.id ? { ...s, visible: newVal } : s)));
    router.refresh();
  };

  // Move a section up or down in the list
  const move = (index, direction) => {
    const next = [...sections];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    // Re-assign sort_order based on new position
    const reordered = next.map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);
  };

  // Save the new order to Supabase
  const saveOrder = async () => {
    setReordering(true);
    const supabase = createClient();
    const updates = sections.map((s) =>
      supabase.from("sections").update({ sort_order: s.sort_order }).eq("id", s.id)
    );
    await Promise.all(updates);
    setReordering(false);
    router.refresh();
  };

  const productMap = allProducts.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  return (
    <>
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">All Sections</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>
              {sections.filter((s) => s.visible).length} visible · {sections.length} total
            </span>
            <button onClick={saveOrder} className="btn-ghost" disabled={reordering}>
              {reordering ? "Saving…" : "Save Order"}
            </button>
            <button onClick={() => setEditing("new")} className="btn-primary">
              + New Section
            </button>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(232,223,210,0.4)", fontStyle: "italic", marginBottom: 20, letterSpacing: "0.02em", lineHeight: 1.6 }}>
          Use the ↑ ↓ arrows to reorder sections, then hit "Save Order" to apply on the site.
        </p>

        {sections.length === 0 ? (
          <div className="empty-state">
            No sections yet. Click "+ New Section" to create your first one.
          </div>
        ) : (
          <div className="product-list">
            {sections.map((s, index) => {
              const preview = (s.product_ids || []).slice(0, 3).map((id) => productMap[id]).filter(Boolean);
              return (
                <div key={s.id} className="section-row">
                  {/* Reorder arrows */}
                  <div className="section-reorder-btns">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="section-reorder-btn"
                      title="Move up"
                    >↑</button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === sections.length - 1}
                      className="section-reorder-btn"
                      title="Move down"
                    >↓</button>
                  </div>

                  <div className="section-row-info">
                    <div className="section-row-title">
                      {s.title}
                      {!s.visible && <span className="section-hidden-badge">Hidden</span>}
                    </div>
                    {s.subtitle && (
                      <div className="section-row-subtitle">{s.subtitle}</div>
                    )}
                    <div className="section-row-meta">
                      <span>{(s.product_ids || []).length} products</span>
                      <span style={{ color: "rgba(232,223,210,0.25)" }}>·</span>
                      <span style={{ color: "rgba(212,165,116,0.6)", letterSpacing: "0.08em" }}>/category/{s.slug}</span>
                    </div>
                    {preview.length > 0 && (
                      <div className="section-row-preview">
                        {preview.map((p) => (
                          <div key={p.id} className="section-preview-img">
                            {p.image_url && <img src={p.image_url} alt={p.title} />}
                          </div>
                        ))}
                        {(s.product_ids || []).length > 3 && (
                          <div className="section-preview-more">+{(s.product_ids || []).length - 3}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="product-row-actions">
                    <button
                      onClick={() => toggleVisible(s)}
                      className={s.visible ? "btn-primary" : "btn-ghost"}
                    >
                      {s.visible ? "Live" : "Hidden"}
                    </button>
                    <button onClick={() => setEditing(s)} className="btn-ghost">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="btn-danger">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <SectionForm
          section={editing === "new" ? null : editing}
          allProducts={allProducts}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

function SectionForm({ section, allProducts, onSave, onCancel }) {
  const [form, setForm] = useState(
    section || {
      title: "",
      slug: "",
      subtitle: "",
      product_ids: [],
      sort_order: 0,
      visible: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const handleTitleChange = (val) => {
    setForm({ ...form, title: val, slug: section ? form.slug : slugify(val) });
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
  const filtered = search.trim()
    ? allProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.category || "").toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <h2>{section ? "Edit Section" : "New Section"}</h2>
        <form onSubmit={handleSubmit} className="form-grid">

          <div className="form-row-2">
            <div className="form-field">
              <label>Section Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Jewellery, Travel Essentials, My Gym Bag…"
              />
            </div>
            <div className="form-field">
              <label>URL Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                placeholder="jewellery"
              />
              <p style={{ fontSize: 10, color: "rgba(232,223,210,0.4)", marginTop: 4 }}>
                Page URL: /category/{form.slug || "your-slug"}
              </p>
            </div>
          </div>

          <div className="form-field">
            <label>Subtitle <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(shown below section title)</span></label>
            <input
              type="text"
              value={form.subtitle || ""}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="the pieces I never take off"
            />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Sort Order <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(lower = appears first)</span></label>
              <input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <label className="checkbox-label" style={{ marginTop: 22 }}>
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                />
                <span>Visible on site</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>
              Products in this Section
              <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
                ({(form.product_ids || []).length} selected)
              </span>
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              style={{ marginBottom: 10 }}
            />

            <div className="look-product-picker">
              {allProducts.length === 0 ? (
                <p style={{ padding: 20, color: "rgba(232,223,210,0.4)", fontStyle: "italic", textAlign: "center" }}>
                  Add products first, then assign them to sections.
                </p>
              ) : filtered.length === 0 ? (
                <p style={{ padding: 20, color: "rgba(232,223,210,0.4)", fontStyle: "italic", textAlign: "center" }}>
                  No products match your search.
                </p>
              ) : (
                Object.keys(grouped).map((cat) => (
                  <div key={cat} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#d4a574", marginBottom: 8 }}>
                      {cat}
                    </div>
                    <div className="look-product-grid">
                      {grouped[cat].map((p) => {
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

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Section"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
