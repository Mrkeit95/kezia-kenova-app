"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

const FIXED_BLOCKS = [
  { id: "about", label: "About Me", icon: "◎", description: "Bio popup" },
  { id: "brands", label: "High End Brands", icon: "◈", description: "Brand gallery popup" },
  { id: "local_brands", label: "Local Brands", icon: "◈", description: "Local brands popup" },
  { id: "tiktok", label: "TikTok Videos", icon: "♪", description: "TikTok video carousel" },
  { id: "instagram", label: "Instagram Videos", icon: "◉", description: "Instagram video carousel" },
  { id: "looks", label: "Get the Look", icon: "✦", description: "Outfit grid" },
];

export default function LayoutManager({ initialLayout, sections, hasTikTok, hasInstagram }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Build all available blocks
  const allBlocks = [
    ...FIXED_BLOCKS,
    ...(sections || []).map((s) => ({
      id: `section_${s.slug}`,
      label: s.title,
      icon: "▦",
      description: `Product carousel · /category/${s.slug}`,
    })),
  ];

  // Build initial order from saved layout or default
  const buildInitial = () => {
    if (initialLayout && Array.isArray(initialLayout) && initialLayout.length > 0) {
      // merge saved order with any new blocks
      const saved = initialLayout.filter((id) => allBlocks.find((b) => b.id === id));
      const newBlocks = allBlocks.map((b) => b.id).filter((id) => !saved.includes(id));
      return [...saved, ...newBlocks];
    }
    // Default: tiktok and instagram at the bottom
    const defaultOrder = ["about", "brands", "local_brands", "looks"];
    sections.forEach((s) => defaultOrder.push(`section_${s.slug}`));
    defaultOrder.push("tiktok", "instagram");
    return defaultOrder;
  };

  const [order, setOrder] = useState(buildInitial);

  const move = (index, direction) => {
    const next = [...order];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setOrder(next);
  };

  const saveLayout = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("settings").update({ homepage_layout: order }).eq("id", 1);
    if (error) { alert("Save failed: " + error.message); }
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); router.refresh(); }
    setSaving(false);
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2 className="admin-section-title">Homepage Sections</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 12, color: "#d4a574", letterSpacing: "0.16em" }}>✓ Saved</span>}
          <button onClick={saveLayout} className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Layout"}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "rgba(232,223,210,0.4)", fontStyle: "italic", marginBottom: 24, lineHeight: 1.6 }}>
        Use ↑ ↓ to reorder. TikTok and Instagram are at the bottom by default. Hit "Save Layout" to apply.
      </p>

      <div className="product-list">
        {order.map((blockId, index) => {
          const block = allBlocks.find((b) => b.id === blockId);
          if (!block) return null;
          return (
            <div key={blockId} className="section-row">
              <div className="section-reorder-btns">
                <button onClick={() => move(index, -1)} disabled={index === 0} className="section-reorder-btn" title="Move up">↑</button>
                <button onClick={() => move(index, 1)} disabled={index === order.length - 1} className="section-reorder-btn" title="Move down">↓</button>
              </div>
              <div className="section-row-info">
                <div className="section-row-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16, opacity: 0.6 }}>{block.icon}</span>
                  {block.label}
                </div>
                <div className="section-row-subtitle">{block.description}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(232,223,210,0.3)", letterSpacing: "0.12em" }}>#{index + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
