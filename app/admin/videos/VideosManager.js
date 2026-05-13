"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function extractTikTokId(url) {
  if (!url) return null;
  const m = url.match(/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractInstagramId(url) {
  if (!url) return null;
  const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
  const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : null;
}

function isValidUrl(platform, url) {
  if (!url) return false;
  if (platform === "tiktok") return !!extractTikTokId(url);
  // For instagram, just check it contains instagram.com and has /reel/ or /p/ or /reels/
  return url.includes("instagram.com") && !!extractInstagramId(url);
}

function VideoPreview({ platform, url }) {
  const valid = isValidUrl(platform, url);
  return (
    <div style={{
      fontSize: 10, letterSpacing: "0.1em",
      color: valid ? "rgba(212,165,116,0.7)" : "rgba(201,122,106,0.7)",
      marginTop: 4
    }}>
      {url ? (valid ? `✓ Valid URL` : `✗ Couldn't detect video — make sure it's a full URL like instagram.com/reels/ABC123/`) : ""}
    </div>
  );
}

export default function VideosManager({ initialVideos }) {
  const sorted = [...initialVideos].sort((a, b) => a.sort_order - b.sort_order);
  const [videos, setVideos] = useState(sorted);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fetchingAll, setFetchingAll] = useState(false);
  const router = useRouter();

  // Bulk-fetch thumbnails for all videos that are missing one
  const fetchAllThumbnails = async () => {
    const missing = videos.filter((v) => !v.thumbnail_url && v.url);
    if (missing.length === 0) return alert("All videos already have thumbnails!");
    setFetchingAll(true);
    const supabase = createClient();
    let updated = [...videos];
    for (const v of missing) {
      try {
        const res = await fetch(`/api/oembed?url=${encodeURIComponent(v.url)}&platform=${v.platform}`);
        const data = await res.json();
        if (data.thumbnail_url) {
          await supabase.from("videos").update({ thumbnail_url: data.thumbnail_url }).eq("id", v.id);
          updated = updated.map((u) => u.id === v.id ? { ...u, thumbnail_url: data.thumbnail_url } : u);
        }
      } catch {}
    }
    setVideos(updated);
    setFetchingAll(false);
    router.refresh();
  };

  const tiktoks = videos.filter((v) => v.platform === "tiktok").sort((a, b) => a.sort_order - b.sort_order);
  const instagrams = videos.filter((v) => v.platform === "instagram").sort((a, b) => a.sort_order - b.sort_order);

  const handleSave = async (video) => {
    const supabase = createClient();

    // Auto-fetch thumbnail if not already set
    let thumbnailUrl = video.thumbnail_url || "";
    if (!thumbnailUrl && video.url) {
      try {
        const res = await fetch(`/api/oembed?url=${encodeURIComponent(video.url.trim())}&platform=${video.platform}`);
        const data = await res.json();
        if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
      } catch {}
    }

    const payload = {
      platform: video.platform,
      url: video.url.trim(),
      caption: video.caption || "",
      visible: video.visible,
      sort_order: video.sort_order ?? 0,
      thumbnail_url: thumbnailUrl,
    };
    if (video.id) {
      const { error } = await supabase.from("videos").update(payload).eq("id", video.id);
      if (error) return alert("Save failed: " + error.message);
      setVideos(videos.map((v) => (v.id === video.id ? { ...v, ...payload } : v)));
    } else {
      const { data, error } = await supabase.from("videos").insert(payload).select().single();
      if (error) return alert("Create failed: " + error.message);
      setVideos([...videos, data]);
    }
    setEditing(null);
    router.refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this video?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
    setVideos(videos.filter((v) => v.id !== id));
    router.refresh();
  };

  const toggleVisible = async (video) => {
    const supabase = createClient();
    const newVal = !video.visible;
    const { error } = await supabase.from("videos").update({ visible: newVal }).eq("id", video.id);
    if (error) return alert("Failed: " + error.message);
    setVideos(videos.map((v) => (v.id === video.id ? { ...v, visible: newVal } : v)));
    router.refresh();
  };

  const move = (platform, index, direction) => {
    const group = platform === "tiktok" ? [...tiktoks] : [...instagrams];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= group.length) return;
    [group[index], group[swapIndex]] = [group[swapIndex], group[index]];
    const reordered = group.map((v, i) => ({ ...v, sort_order: i }));
    const otherPlatform = platform === "tiktok" ? instagrams : tiktoks;
    setVideos([...otherPlatform, ...reordered]);
  };

  const saveOrder = async (platform) => {
    setSaving(true);
    const supabase = createClient();
    const group = platform === "tiktok" ? tiktoks : instagrams;
    await Promise.all(group.map((v) => supabase.from("videos").update({ sort_order: v.sort_order }).eq("id", v.id)));
    setSaving(false);
    router.refresh();
  };

  const renderGroup = (list, platform, label) => (
    <div className="admin-section" style={{ marginBottom: 28 }}>
      <div className="admin-section-head">
        <h2 className="admin-section-title">{label}</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>
            {list.filter((v) => v.visible).length} visible · {list.length} total
          </span>
          <button onClick={() => saveOrder(platform)} className="btn-ghost" disabled={saving}>
            {saving ? "Saving…" : "Save Order"}
          </button>
          <button onClick={() => setEditing({ platform, url: "", caption: "", visible: true, sort_order: list.length, thumbnail_url: "" })} className="btn-primary">
            + Add Video
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "rgba(232,223,210,0.4)", fontStyle: "italic", marginBottom: 16, lineHeight: 1.6 }}>
        {platform === "tiktok"
          ? "Paste the full TikTok video URL. Thumbnail is fetched automatically when you save."
          : "Paste the full Instagram Reel URL e.g. https://www.instagram.com/reels/ABC123/ — thumbnail is auto-fetched when you save."}
      </p>

      {list.length === 0 ? (
        <div className="empty-state">No {label} videos yet. Click "+ Add Video" to add one.</div>
      ) : (
        <div className="product-list">
          {list.map((v, index) => (
            <div key={v.id} className="video-row">
              {/* Reorder */}
              <div className="section-reorder-btns">
                <button onClick={() => move(platform, index, -1)} disabled={index === 0} className="section-reorder-btn">↑</button>
                <button onClick={() => move(platform, index, 1)} disabled={index === list.length - 1} className="section-reorder-btn">↓</button>
              </div>
              {/* Thumbnail */}
              <div className="video-row-thumb">
                {v.thumbnail_url ? (
                  <div className="video-row-thumbnail">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.thumbnail_url} alt="" />
                    <div className={`video-row-platform-dot ${platform}`}>
                      {platform === "tiktok"
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>}
                    </div>
                  </div>
                ) : (
                  <div className={`video-platform-badge ${platform}`}>
                    {platform === "tiktok"
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>}
                  </div>
                )}
              </div>
              <div className="product-row-info">
                <div className="product-row-title">
                  {v.caption || <span style={{ opacity: 0.4, fontStyle: "italic" }}>No caption</span>}
                  {!v.visible && <span className="section-hidden-badge" style={{ marginLeft: 8 }}>Hidden</span>}
                </div>
                <div className="product-row-meta">
                  <span style={{ color: "rgba(212,165,116,0.6)", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.url}</span>
                </div>
              </div>
              <div className="product-row-actions">
                <button onClick={() => toggleVisible(v)} className={v.visible ? "btn-primary" : "btn-ghost"}>{v.visible ? "Live" : "Hidden"}</button>
                <button onClick={() => setEditing(v)} className="btn-ghost">Edit</button>
                <button onClick={() => handleDelete(v.id)} className="btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const missingThumbs = videos.filter((v) => !v.thumbnail_url).length;

  return (
    <>
      {missingThumbs > 0 && (
        <div style={{ background: "rgba(212,165,116,0.08)", border: "1px solid rgba(212,165,116,0.2)", borderRadius: 8, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(232,223,210,0.7)", letterSpacing: "0.06em" }}>
            {missingThumbs} video{missingThumbs > 1 ? "s are" : " is"} missing a thumbnail
          </span>
          <button onClick={fetchAllThumbnails} className="btn-primary" disabled={fetchingAll} style={{ flexShrink: 0 }}>
            {fetchingAll ? "Fetching…" : "Auto-Fetch All Thumbnails"}
          </button>
        </div>
      )}
      {renderGroup(tiktoks, "tiktok", "TikTok Videos")}
      {renderGroup(instagrams, "instagram", "Instagram Videos")}
      {editing && <VideoForm video={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
    </>
  );
}

function VideoForm({ video, onSave, onCancel }) {
  const [form, setForm] = useState({ ...video });
  const [saving, setSaving] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [fetchingThumb, setFetchingThumb] = useState(false);
  const thumbInputRef = useRef(null);

  // Auto-fetch thumbnail when URL is valid
  useEffect(() => {
    const url = form.url?.trim();
    if (!url) return;
    // Don't re-fetch if user already has a thumbnail (unless they cleared it)
    if (form.thumbnail_url) return;
    const valid = isValidUrl(form.platform, url);
    if (!valid) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setFetchingThumb(true);
      try {
        const res = await fetch(`/api/oembed?url=${encodeURIComponent(url)}&platform=${form.platform}`);
        const data = await res.json();
        if (!cancelled && data.thumbnail_url) {
          setForm((prev) => ({ ...prev, thumbnail_url: data.thumbnail_url }));
        }
      } catch {}
      if (!cancelled) setFetchingThumb(false);
    }, 900);
    return () => { cancelled = true; clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.url, form.thumbnail_url]);

  const handleThumbUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) { alert("Image too large — max 8MB"); return; }
    setThumbUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filename = `thumb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(filename, file);
      if (error) { alert("Upload failed: " + error.message); }
      else {
        const { data } = supabase.storage.from("product-images").getPublicUrl(filename);
        setForm((prev) => ({ ...prev, thumbnail_url: data.publicUrl }));
      }
    } catch (e) { alert("Upload failed: " + e.message); }
    setThumbUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url.trim()) return alert("Please enter a video URL.");
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{video.id ? "Edit Video" : `Add ${form.platform === "tiktok" ? "TikTok" : "Instagram"} Video`}</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label>Video URL</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value, thumbnail_url: "" })}
              placeholder={form.platform === "tiktok"
                ? "https://www.tiktok.com/@username/video/1234567890"
                : "https://www.instagram.com/reels/DLUMqg-yovr/"}
              required
            />
            <VideoPreview platform={form.platform} url={form.url} />
            <p style={{ fontSize: 10, color: "rgba(232,223,210,0.35)", marginTop: 6, lineHeight: 1.6 }}>
              {form.platform === "tiktok"
                ? "Tap Share → Copy Link in TikTok. Thumbnail fetched automatically."
                : "Tap ··· → Copy Link in Instagram. Upload a screenshot as thumbnail below."}
            </p>
          </div>

          {/* Thumbnail */}
          <div className="form-field">
            <label>
              Thumbnail
              {fetchingThumb && <span style={{ opacity: 0.5, fontStyle: "italic", textTransform: "none", letterSpacing: 0, marginLeft: 8 }}>auto-fetching…</span>}
              {!fetchingThumb && !form.thumbnail_url && <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0, marginLeft: 8 }}>— auto-fetched on save</span>}
            </label>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              {form.thumbnail_url && (
                <div style={{ position: "relative", flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.thumbnail_url} alt="Thumbnail" style={{ width: 72, height: 108, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(232,223,210,0.15)" }} />
                  <button type="button" onClick={() => setForm({ ...form, thumbnail_url: "" })} style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, background: "rgba(0,0,0,0.75)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>×</button>
                </div>
              )}
              <div
                className="brand-upload-area"
                style={{ flex: 1, padding: "18px 14px", marginBottom: 0 }}
                onClick={() => thumbInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleThumbUpload(e.dataTransfer.files[0]); }}
              >
                {thumbUploading ? <span>Uploading…</span> : (
                  <span style={{ fontSize: 11 }}>
                    {form.thumbnail_url ? "Replace thumbnail" : "Upload thumbnail"}<br />
                    <span style={{ fontSize: 10, opacity: 0.5 }}>
                      Auto-fetched on save · or upload your own here
                    </span>
                  </span>
                )}
                <input ref={thumbInputRef} type="file" accept="image/*" onChange={(e) => handleThumbUpload(e.target.files[0])} style={{ display: "none" }} />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>Caption <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <input type="text" value={form.caption || ""} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="What's this video about?" />
          </div>

          <div className="form-row-2">
            <div className="form-field">
              <label>Sort Order</label>
              <input type="number" value={form.sort_order ?? 0} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="form-field" style={{ justifyContent: "flex-end" }}>
              <label className="checkbox-label" style={{ marginTop: 22 }}>
                <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
                <span>Visible on site</span>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Video"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
