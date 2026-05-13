"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

function extractTikTokId(url) {
  const m = url.match(/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractInstagramId(url) {
  const m = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : null;
}

function VideoPreview({ platform, url }) {
  const isValid = platform === "tiktok" ? !!extractTikTokId(url) : !!extractInstagramId(url);
  return (
    <div style={{
      fontSize: 10, letterSpacing: "0.1em",
      color: isValid ? "rgba(212,165,116,0.7)" : "rgba(201,122,106,0.7)",
      marginTop: 4
    }}>
      {url
        ? isValid
          ? `✓ Valid ${platform === "tiktok" ? "TikTok" : "Instagram"} URL`
          : `✗ Couldn't detect video ID — double-check the URL`
        : ""}
    </div>
  );
}

export default function VideosManager({ initialVideos }) {
  const [videos, setVideos] = useState(initialVideos);
  const [editing, setEditing] = useState(null);
  const router = useRouter();

  const tiktoks = videos.filter((v) => v.platform === "tiktok").sort((a, b) => a.sort_order - b.sort_order);
  const instagrams = videos.filter((v) => v.platform === "instagram").sort((a, b) => a.sort_order - b.sort_order);

  const handleSave = async (video) => {
    const supabase = createClient();
    const payload = {
      platform: video.platform,
      url: video.url.trim(),
      caption: video.caption || "",
      visible: video.visible,
      sort_order: video.sort_order ?? 0,
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

  const renderGroup = (list, platform, label, icon) => (
    <div className="admin-section" style={{ marginBottom: 28 }}>
      <div className="admin-section-head">
        <h2 className="admin-section-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{icon}</span> {label}
        </h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "rgba(232,223,210,0.5)", letterSpacing: "0.1em" }}>
            {list.filter((v) => v.visible).length} visible · {list.length} total
          </span>
          <button onClick={() => setEditing({ platform, url: "", caption: "", visible: true, sort_order: list.length })} className="btn-primary">
            + Add Video
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "rgba(232,223,210,0.4)", fontStyle: "italic", marginBottom: 16, lineHeight: 1.6 }}>
        {platform === "tiktok"
          ? "Paste the full URL of a TikTok video. Visitors can watch it on-site then tap through to buy via the TikTok affiliate yellow card."
          : "Paste the full URL of an Instagram Reel or post. Visitors can watch it on-site then open it on Instagram."}
      </p>

      {list.length === 0 ? (
        <div className="empty-state">No {label} videos yet. Click "+ Add Video" to add one.</div>
      ) : (
        <div className="product-list">
          {list.map((v) => {
            const videoId = platform === "tiktok" ? extractTikTokId(v.url) : extractInstagramId(v.url);
            return (
              <div key={v.id} className="video-row">
                <div className="video-row-thumb">
                  {platform === "tiktok" && videoId ? (
                    <div className="video-platform-badge tiktok">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                      </svg>
                    </div>
                  ) : platform === "instagram" && videoId ? (
                    <div className="video-platform-badge instagram">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                      </svg>
                    </div>
                  ) : (
                    <div className="video-platform-badge error">?</div>
                  )}
                </div>
                <div className="product-row-info">
                  <div className="product-row-title">
                    {v.caption || <span style={{ opacity: 0.4, fontStyle: "italic" }}>No caption</span>}
                    {!v.visible && <span className="section-hidden-badge" style={{ marginLeft: 8 }}>Hidden</span>}
                  </div>
                  <div className="product-row-meta">
                    <span style={{ color: "rgba(212,165,116,0.6)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.url}
                    </span>
                  </div>
                </div>
                <div className="product-row-actions">
                  <button onClick={() => toggleVisible(v)} className={v.visible ? "btn-primary" : "btn-ghost"}>
                    {v.visible ? "Live" : "Hidden"}
                  </button>
                  <button onClick={() => setEditing(v)} className="btn-ghost">Edit</button>
                  <button onClick={() => handleDelete(v.id)} className="btn-danger">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <>
      {renderGroup(tiktoks, "tiktok", "TikTok Videos", "♪")}
      {renderGroup(instagrams, "instagram", "Instagram Videos", "◈")}

      {editing && (
        <VideoForm
          video={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </>
  );
}

function VideoForm({ video, onSave, onCancel }) {
  const [form, setForm] = useState({ ...video });
  const [saving, setSaving] = useState(false);

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
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder={form.platform === "tiktok"
                ? "https://www.tiktok.com/@username/video/1234567890"
                : "https://www.instagram.com/reel/ABC123/"}
              required
            />
            <VideoPreview platform={form.platform} url={form.url} />
            <p style={{ fontSize: 10, color: "rgba(232,223,210,0.35)", marginTop: 8, lineHeight: 1.6 }}>
              {form.platform === "tiktok"
                ? "Copy the URL from the TikTok app — tap Share → Copy Link, or use the browser URL."
                : "Copy the URL from the Instagram app — tap ··· → Copy Link, or use the browser URL."}
            </p>
          </div>

          <div className="form-field">
            <label>Caption <span style={{ opacity: 0.5, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
            <input
              type="text"
              value={form.caption || ""}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="What's this video about?"
            />
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

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Video"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
