"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/subscribers", label: "Subscribers" },
    { href: "/admin/analytics", label: "Analytics" },
  ];

  return (
    <nav className="admin-nav">
      <div className="admin-nav-inner">
        <div className="admin-brand">
          <div className="admin-brand-logo">K</div>
          <span>Kezia</span>
        </div>

        <div className="admin-nav-links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`admin-nav-link ${pathname === l.href ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="admin-nav-actions">
          <Link href="/" target="_blank" className="admin-view-site">View Site ↗</Link>
          <button onClick={handleSignOut} className="admin-signout">Sign Out</button>
        </div>
      </div>
    </nav>
  );
}
