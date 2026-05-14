"use client";

import { useEffect } from "react";

function extractTikTokId(url) {
  const m = url.match(/video\/(\d+)/);
  return m ? m[1] : null;
}

function extractInstagramId(url) {
  if (!url) return null;
  const clean = url.split(/[?#]/)[0].replace(/\/+$/, "");
  const m = clean.match(/\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[2] : null;
}

export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!video) return null;

  const isTikTok = video.platform === "tiktok";
  const isInstagram = video.platform === "instagram";
  const tikTokId = isTikTok ? extractTikTokId(video.url) : null;
  const instagramId = isInstagram ? extractInstagramId(video.url) : null;

  const embedUrl = isTikTok && tikTokId
    ? `https://www.tiktok.com/embed/v2/${tikTokId}`
    : isInstagram && instagramId
    ? `https://www.instagram.com/p/${instagramId}/embed/captioned/`
    : null;

  const shopLabel = isTikTok ? "Watch & Shop on TikTok ↗" : "Open on Instagram ↗";

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="video-modal-header">
          <div className="video-modal-platform">
            {isTikTok ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            )}
            <span>{isTikTok ? "TikTok" : "Instagram"}</span>
          </div>
          {video.caption && <p className="video-modal-caption">{video.caption}</p>}
          <button className="video-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="video-modal-embed">
          {embedUrl ? (
            <div className={`video-embed-clip ${isInstagram ? "instagram-clip" : ""}`}>
              <iframe
                src={embedUrl}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                title={video.caption || "Video"}
                style={{ border: "none", width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="video-modal-error">
              <p>Could not load video preview.</p>
              <p style={{ fontSize: 12, opacity: 0.5, marginTop: 8 }}>The URL may be invalid.</p>
            </div>
          )}
        </div>

        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="video-modal-cta"
        >
          {isTikTok && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          )}
          {shopLabel}
        </a>

        {isTikTok && (
          <p className="video-modal-hint">
            Tap the yellow shopping cart in the video to purchase through TikTok's affiliate program
          </p>
        )}
      </div>
    </div>
  );
}
