"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/sections", label: "Sections" },
    { href: "/admin/looks", label: "Looks" },
    { href: "/admin/videos", label: "Videos" },
    { href: "/admin/layout", label: "Layout" },
    { href: "/admin/analytics", label: "Analytics" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <nav className="admin-nav">
      <div className="admin-nav-inner">
        <div className="admin-brand">
          <div className="admin-brand-logo">K</div>
          <span>Kezia</span>
        </div>

        <button
          className="admin-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>

        <div className={`admin-nav-links ${menuOpen ? "open" : ""}`}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`admin-nav-link ${pathname === l.href ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="admin-mobile-actions">
            <Link href="/" target="_blank" className="admin-view-site">View Site ↗</Link>
            <button onClick={handleSignOut} className="admin-signout">Sign Out</button>
          </div>
        </div>

        <div className="admin-nav-actions admin-desktop-only">
          <Link href="/" target="_blank" className="admin-view-site">View Site ↗</Link>
          <button onClick={handleSignOut} className="admin-signout">Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
