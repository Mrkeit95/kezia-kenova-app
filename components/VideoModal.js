"use client";

import { useEffect } from "react";

export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!video) return null;

  const isTikTok = video.platform === "tiktok";
  const isInstagram = video.platform === "instagram";

  const platformLabel = isTikTok ? "TikTok" : "Instagram";
  const ctaLabel = isTikTok ? "Watch & Shop on TikTok ↗" : "Watch on Instagram ↗";
  const tapLabel = isTikTok ? "Tap to watch on TikTok" : "Tap to watch on Instagram";

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
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
            <span>{platformLabel}</span>
          </div>
          {video.caption && <p className="video-modal-caption">{video.caption}</p>}
          <button className="video-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Thumbnail player — same for both TikTok and Instagram, no iframes */}
        <div className="video-modal-embed">
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="video-modal-thumb-player"
            onClick={onClose}
          >
            {video.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={video.thumbnail_url}
                alt={video.caption || platformLabel}
                className="video-modal-thumb-player-img"
              />
            ) : (
              <div className="video-modal-thumb-placeholder" />
            )}
            <div className="video-modal-thumb-overlay">
              <div className="video-modal-thumb-play">
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="video-modal-thumb-label">{tapLabel}</p>
            </div>
          </a>
        </div>

        {/* CTA button */}
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="video-modal-cta"
        >
          {isTikTok ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
            </svg>
          )}
          {ctaLabel}
        </a>

        {isTikTok && (
          <p className="video-modal-hint">
            Shop the yellow cart in the TikTok video to purchase through TikTok Shop
          </p>
        )}
      </div>
    </div>
  );
}
