"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function JournalManager({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);
  const [editing, setEditing] = useState(null);
  const router = useRouter();

  const handleSave = async (post) => {
    const supabase = createClient();
    const payload = {
      title: post.title,
      slug: post.slug || slugify(post.title),
      excerpt: post.excerpt,
      content: post.content,
      cover_image: post.cover_image,
      published: post.published,
      published_at: post.published && !post.published_at ? new Date().toISOString() : post.published_at,
    };

    if (post.id) {
      const { error } = await supabase.from("journal_posts").update(payload).eq("id", post.id);
      if (error) return alert("Save failed: " + error.message);
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, ...payload } : p)));
    } else {
      const { data, error } = await supabase.from("journal_posts").insert(payload).select().single();
      if (error) return alert("Create failed: " + error.message);
      setPosts([data, ...posts]);
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this post? This can't be undone.")) return;
    const supabase = createClient();
    const { error } = await supabase.from("journal_posts").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
    setPosts(posts.filter((p) => p.id !== id));
    router.refresh();
  };

  return (
    <>
      <div className="admin-section">
        <div className="admin-section-head">
          <h2 className="admin-section-title">All Posts</h2>
          <button onClick={() => setEditing("new")} className="btn-primary">+ New Post</button>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">No posts yet. Click "New Post" to write your first one.</div>
        ) : (
          <div className="product-list">
            {posts.map((p) => (
              <div key={p.id} className="product-row">
                <div className="product-row-img" style={{ aspectRatio: "16/9", width: 80, height: 50 }}>
                  {p.cover_image && <img src={p.cover_image} alt="" />}
                </div>
                <div className="product-row-info">
                  <div className="product-row-title">{p.title}</div>
                  <div className="product-row-meta">
                    {p.published ? (
                      <span style={{ color: "#d4a574" }}>● Published</span>
                    ) : (
                      <span style={{ color: "rgba(232,223,210,0.4)" }}>○ Draft</span>
                    )}
                    <span>{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="product-row-actions">
                  <button onClick={() => setEditing(p)} className="btn-ghost">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <PostForm
          post={editing === "new" ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

function PostForm({ post, onSave, onCancel }) {
  const [form, setForm] = useState(
    post || { title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false }
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
      const filename = `journal-${Date.now()}.${ext}`;
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

  const handleTitleChange = (val) => {
    setForm({ ...form, title: val, slug: post ? form.slug : slugify(val) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
        <h2>{post ? "Edit Post" : "New Post"}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label>Cover Image</label>
            <div
              className="image-upload"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
              onClick={() => fileInputRef.current?.click()}
              style={{ aspectRatio: "16/9", minHeight: "auto" }}
            >
              {form.cover_image ? (
                <div className="image-upload-preview" style={{ aspectRatio: "16/9", maxHeight: "none" }}>
                  <img src={form.cover_image} alt="" />
                  <div className="image-upload-overlay"><span>{uploading ? "Uploading…" : "Click to replace"}</span></div>
                </div>
              ) : (
                <div className="image-upload-empty">
                  <span>{uploading ? "Uploading…" : "Click to upload cover image"}</span>
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
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="Two weeks in the Uluwatu cliffs"
            />
          </div>

          <div className="form-field">
            <label>URL Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
              placeholder="two-weeks-uluwatu"
            />
            <p style={{ fontSize: 10, color: "rgba(232,223,210,0.4)", marginTop: 4, letterSpacing: "0.04em" }}>
              Auto-generated from title. The URL will be /journal/{form.slug || "your-slug"}
            </p>
          </div>

          <div className="form-field">
            <label>Excerpt (short preview)</label>
            <textarea
              value={form.excerpt || ""}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="One or two sentences that appear in the journal preview list…"
              rows={2}
            />
          </div>

          <div className="form-field">
            <label>Content</label>
            <textarea
              value={form.content || ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your story here…&#10;&#10;Separate paragraphs with a blank line."
              rows={14}
              style={{ fontFamily: "inherit", lineHeight: 1.6 }}
            />
            <p style={{ fontSize: 10, color: "rgba(232,223,210,0.4)", marginTop: 4 }}>
              Tip: leave a blank line between paragraphs.
            </p>
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
              />
              <span>Published (visible on site)</span>
            </label>
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
