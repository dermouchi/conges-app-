import { useApp } from "../context/AppContext";

const STATUS_STYLE = {
  "validé": { background: "#dcfce7", color: "#16a34a" },
  "en attente": { background: "#fef9c3", color: "#b45309" },
  "rejeté": { background: "#fee2e2", color: "#dc2626" },
};

export default function Validation() {
  const { data, setData, user } = useApp();

  const pendingRequests = data.requests
    .filter(r => {
      if (r.status !== "en attente") return false;
      if (user.role === "manager") return true;
      const requester = data.users.find(u => u.id === r.userId);
      return requester && requester.team === user.team;
    })
    .sort((a, b) => b.id - a.id);

  const allManaged = data.requests
    .filter(r => {
      if (r.status === "en attente") return false;
      if (user.role === "manager") return true;
      const requester = data.users.find(u => u.id === r.userId);
      return requester && requester.team === user.team;
    })
    .sort((a, b) => b.id - a.id);

  const handle = (id, action) => {
    setData(d => ({
      ...d,
      requests: d.requests.map(r => r.id === id ? { ...r, status: action === "approve" ? "validé" : "rejeté" } : r),
    }));
  };

  const getUser = (id) => data.users.find(u => u.id === id);

  return (
    <div>
      <h2 style={styles.title}>✅ Validation des Demandes</h2>
      <p style={styles.sub}>Approuver ou rejeter les demandes de congé</p>

      <h3 style={styles.sectionTitle}>En attente ({pendingRequests.length})</h3>
      {pendingRequests.length === 0 ? (
        <div style={styles.empty}>Aucune demande en attente. 🎉</div>
      ) : (
        <div style={styles.list}>
          {pendingRequests.map(req => {
            const u = getUser(req.userId);
            return (
              <div key={req.id} style={styles.card}>
                <div style={styles.cardLeft}>
                  <div style={styles.avatar}>{u?.name[0]}</div>
                  <div>
                    <div style={styles.name}>{u?.name}</div>
                    <div style={styles.team}>{u?.team ? `Équipe ${u.team}` : ""}</div>
                    <div style={styles.detail}>{req.type} · {req.dateStart} → {req.dateEnd} · <strong>{req.days}j</strong></div>
                    <div style={styles.date}>Soumis le {req.createdAt}</div>
                  </div>
                </div>
                <div style={styles.actions}>
                  <button style={styles.btnApprove} onClick={() => handle(req.id, "approve")}>✓ Approuver</button>
                  <button style={styles.btnReject} onClick={() => handle(req.id, "reject")}>✕ Rejeter</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {allManaged.length > 0 && (
        <>
          <h3 style={{ ...styles.sectionTitle, marginTop: 32 }}>Historique</h3>
          <div style={styles.list}>
            {allManaged.slice(0, 10).map(req => {
              const u = getUser(req.userId);
              return (
                <div key={req.id} style={{ ...styles.card, opacity: 0.75 }}>
                  <div style={styles.cardLeft}>
                    <div style={styles.avatar}>{u?.name[0]}</div>
                    <div>
                      <div style={styles.name}>{u?.name}</div>
                      <div style={styles.detail}>{req.type} · {req.dateStart} → {req.dateEnd} · {req.days}j</div>
                    </div>
                  </div>
                  <span style={{ ...styles.badge, ...STATUS_STYLE[req.status] }}>{req.status}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 24px", color: "#64748b", fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 12 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#fff", borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  cardLeft: { display: "flex", alignItems: "center", gap: 14 },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #0072ff, #00c6ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 },
  name: { fontWeight: 700, fontSize: 15, color: "#1e293b" },
  team: { fontSize: 12, color: "#94a3b8" },
  detail: { fontSize: 14, color: "#475569", marginTop: 2 },
  date: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  actions: { display: "flex", gap: 8 },
  btnApprove: { padding: "8px 16px", borderRadius: 8, border: "none", background: "#22c55e", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  btnReject: { padding: "8px 16px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#ef4444", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  badge: { padding: "4px 12px", borderRadius: 20, fontWeight: 600, fontSize: 13 },
  empty: { textAlign: "center", color: "#94a3b8", fontSize: 15, padding: 40, background: "#f8fafc", borderRadius: 12 },
};
