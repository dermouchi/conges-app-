import { useState } from "react";
import { useApp } from "../context/AppContext";

const STATUS_STYLE = {
  "validé": { background: "#dcfce7", color: "#16a34a" },
  "en attente": { background: "#fef9c3", color: "#b45309" },
  "rejeté": { background: "#fee2e2", color: "#dc2626" },
};

export default function MyRequests() {
  const { data, setData, user } = useApp();
  const [confirmCancel, setConfirmCancel] = useState(null);

  const myRequests = data.requests.filter(r => r.userId === user.id).sort((a, b) => b.id - a.id);

  const handleCancel = (id) => {
    setData(d => ({ ...d, requests: d.requests.map(r => r.id === id ? { ...r, status: "annulé" } : r) }));
    setConfirmCancel(null);
  };

  const canCancel = (req) => req.status === "en attente";

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📋 Mes Demandes de Congé</h2>
          <p style={styles.sub}>Historique de vos demandes</p>
        </div>
        <div style={styles.counters}>
          <div style={styles.counter}><span style={styles.counterVal}>{user.cp}</span><span style={styles.counterLabel}>CP restants</span></div>
          <div style={styles.counter}><span style={styles.counterVal}>{user.rtt}</span><span style={styles.counterLabel}>RTT restants</span></div>
        </div>
      </div>

      {myRequests.length === 0 ? (
        <div style={styles.empty}>Aucune demande pour le moment.</div>
      ) : (
        <div style={styles.list}>
          {myRequests.map(req => (
            <div key={req.id} style={styles.card}>
              <div style={styles.cardLeft}>
                <div style={styles.type}>{req.type}</div>
                <div style={styles.dates}>{req.dateStart} → {req.dateEnd}</div>
                <div style={styles.days}>{req.days} jour{req.days > 1 ? "s" : ""}</div>
              </div>
              <div style={styles.cardRight}>
                <span style={{ ...styles.badge, ...STATUS_STYLE[req.status] }}>{req.status}</span>
                {canCancel(req) && (
                  confirmCancel === req.id ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button style={styles.btnDanger} onClick={() => handleCancel(req.id)}>Confirmer</button>
                      <button style={styles.btnGhost} onClick={() => setConfirmCancel(null)}>Annuler</button>
                    </div>
                  ) : (
                    <button style={styles.btnGhost} onClick={() => setConfirmCancel(req.id)}>✕ Annuler</button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  counters: { display: "flex", gap: 12 },
  counter: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 20px", textAlign: "center", minWidth: 80 },
  counterVal: { display: "block", fontSize: 24, fontWeight: 700, color: "#0072ff" },
  counterLabel: { fontSize: 12, color: "#64748b" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: "#fff", borderRadius: 14, padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  cardLeft: { display: "flex", flexDirection: "column", gap: 4 },
  type: { fontWeight: 700, fontSize: 15, color: "#1e293b" },
  dates: { fontSize: 14, color: "#475569" },
  days: { fontSize: 13, color: "#94a3b8" },
  cardRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  badge: { padding: "4px 12px", borderRadius: 20, fontWeight: 600, fontSize: 13 },
  btnDanger: { padding: "6px 14px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnGhost: { padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" },
  empty: { textAlign: "center", color: "#94a3b8", fontSize: 16, padding: 60 },
};
