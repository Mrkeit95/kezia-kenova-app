"use client";

export default function SubscribersTools({ subscribers }) {
  const handleExport = () => {
    if (!subscribers.length) return;
    const header = "email,signed_up_at\n";
    const rows = subscribers
      .map((s) => `${s.email},${s.created_at}`)
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} className="btn-primary" disabled={!subscribers.length}>
      Export CSV
    </button>
  );
}
