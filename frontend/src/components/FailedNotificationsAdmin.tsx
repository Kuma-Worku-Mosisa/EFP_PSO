import { useEffect, useState } from "react";

type FailedItem = {
  id: string;
  createdAt: string;
  recipientUserId: number;
  notificationType: string;
  context: any;
  attempts?: number;
  lastError?: string;
};

export default function FailedNotificationsAdmin() {
  const [items, setItems] = useState<FailedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/failed");
      const data = await res.json();
      setItems(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleResend = async (id: string) => {
    setResendingId(id);
    try {
      const res = await fetch("/api/notifications/failed/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await res.json();
      // refresh
      await fetchList();
    } catch (err) {
      console.error(err);
      alert("Resend failed. Check server logs.");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Failed Notification Queue</h3>
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <div>No failed notifications queued.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Created</th>
              <th style={{ textAlign: "left", padding: 8 }}>Recipient ID</th>
              <th style={{ textAlign: "left", padding: 8 }}>Type</th>
              <th style={{ textAlign: "left", padding: 8 }}>Attempts</th>
              <th style={{ textAlign: "left", padding: 8 }}>Last Error</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>
                  {new Date(it.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: 8 }}>{it.recipientUserId}</td>
                <td style={{ padding: 8 }}>{it.notificationType}</td>
                <td style={{ padding: 8 }}>{it.attempts || 0}</td>
                <td style={{ padding: 8, maxWidth: 400 }}>{it.lastError}</td>
                <td style={{ padding: 8 }}>
                  <button
                    disabled={resendingId === it.id}
                    onClick={() => handleResend(it.id)}
                  >
                    {resendingId === it.id ? "Resending…" : "Resend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
