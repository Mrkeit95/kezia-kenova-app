"use client";

import { useEffect, useState } from "react";

export default function InfoModal({ open, onClose, title, subtitle, children }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  };

  if (!open) return null;

  return (
    <div
      className={`info-modal-overlay ${closing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`info-modal ${closing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={handleClose} className="info-modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="info-modal-content">
          {subtitle && <div className="info-modal-subtitle">{subtitle}</div>}
          {title && <h2 className="info-modal-title">{title}</h2>}
          <div className="info-modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
