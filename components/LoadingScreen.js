"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 2000);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div className="loading-screen">
      <div className="loading-logo">K</div>
      <div className="loading-bar"></div>
      <div className="loading-name">Kezia Kenova</div>
    </div>
  );
}
