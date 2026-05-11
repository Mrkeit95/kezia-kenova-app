"use client";

import Link from "next/link";

export default function BackButton({ href = "/", label = "Back" }) {
  return (
    <Link href={href} className="back-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>{label}</span>
    </Link>
  );
}
