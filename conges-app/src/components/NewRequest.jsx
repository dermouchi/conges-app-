import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function NewRequest({ onDone }) {
  const { data, setData, user } = useApp();
  const [type, setType] = useState("CP");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const countDays = (s, e) => {
    if (!s || !e) return 0;
    let count = 0;
    const cur = new Date(s);
    const end = new Date(e);
    while (cur <= end) {
      const d = cur.getDay();
      if (d !== 0 && d !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const days = countDays(dateStart, dateEnd);
  const balance = type === "CP" ? user.cp : user.rtt;

  const handleSubmit = () => {
    setError("");
    if (!dateStart || !dateEnd) return setError("Veuillez renseigner les dates.");
    if (dateEnd < dateStart) return setError("La date de fin doit être après la date de début.");
    if (days === 0) return setError("Aucun jour ouvré dans cette période.");
    if (days > balance) return setError(`Solde insuffisant. Vous avez ${balance} jours de ${type}.`);

    // Check team rules
    const teamRule = data.teams.find(t => t.id === user.team);
    if (teamRule) {
      const overlap = data.requests.filter(r => {
        if (r.status === "rejeté" || r.status === "annulé" || r.userId === user.id) return false;
        const ru = data.users.find(u => u.id === r.userId);
        if (!ru || ru.team !== user.team) return false;
        return r.dateStart <= dateEnd && r.dateEnd >= dateStart;
      });
      if (overlap.length >= teamRule.maxAbsents) {
        return setError(`Règle équipe : max ${teamRule.maxAbsents} absent(s) simultané(s) dans votre équipe.`);
      }
    }

    const newReq = {
      id: Date.now(),
      userId: user.id,
      type,
      dateStart,
      dateEnd,
      days,
      status: "en attente",
      createdAt: new Date().toISOString().split("T")[0],
    };

    setData(d => ({
      ...d,
      requests: [...d.requests, newReq],
      users: d.users.map(u => u.id === user.id ? { ...u, [type === "CP" ? "cp" : "rtt"]: u[type === "CP" ? "cp" : "rtt"] - days } : u),
    }));

    setSuccess(true);
    setTimeout(onDone, 1500);
  };

  if (success) return (
    <div style={styles.successWrap}>
      <div style={styles.successIcon}>✅</div>
      <h3 style={{ color: "#16a34a" }}>Demande soumise avec succès !</h3>
      <p style={{ color: "#64748b" }}>En attente de validation...</p>
    </div>
  );

  return (
    <div>
      <h2 style={styles.title}>➕ Nouvelle Demande de Congé</h2>
      <p style={styles.sub}>Remplissez les informations ci-dessous</p>

      <div style={styles.card}>
        <div style={styles.field}>
          <label style={styles.label}>Type de congé</label>
          <div style={styles.typeRow}>
            {["CP", "RTT"].map(t => (
              <button key={t} style={{ ...styles.typeBtn, ...(type === t ? styles.typeBtnActive : {}) }} onClick={() => setType(t)}>
                {t} <span style={styles.balance}>({t === "CP" ? user.cp : user.rtt} j restants)</span>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Date de début</label>
            <input type="date" style={styles.input} value={dateStart} onChange={e => setDateStart(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Date de fin</label>
            <input type="date" style={styles.input} value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
          </div>
        </div>

        {days > 0 && (
          <div style={styles.summary}>
            <span>📆 {days} jour{days > 1 ? "s" : ""} ouvré{days > 1 ? "s" : ""}</span>
            <span style={{ color: days > balance ? "#ef4444" : "#16a34a" }}>
              Solde après : {balance - days} j
            </span>
          </div>
        )}

        {error && <div style={styles.error}>⚠️ {error}</div>}

        <button style={styles.btn} onClick={handleSubmit}>Soumettre la demande</button>
      </div>
    </div>
  );
}

const styles = {
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 24px", color: "#64748b", fontSize: 14 },
  card: { background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #e2e8f0", maxWidth: 560, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 },
  label: { fontWeight: 600, fontSize: 14, color: "#374151" },
  input: { padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" },
  row: { display: "flex", gap: 16 },
  typeRow: { display: "flex", gap: 12 },
  typeBtn: { padding: "10px 24px", borderRadius: 10, border: "2px solid #e2e8f0", background: "#f8fafc", fontSize: 15, fontWeight: 600, cursor: "pointer", color: "#64748b" },
  typeBtnActive: { borderColor: "#0072ff", background: "#eff6ff", color: "#0072ff" },
  balance: { fontSize: 12, fontWeight: 400 },
  summary: { background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: 14, fontWeight: 600, color: "#0369a1" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontSize: 14, marginBottom: 16 },
  btn: { width: "100%", padding: 14, borderRadius: 10, border: "none", background: "linear-gradient(90deg, #0072ff, #00c6ff)", color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer" },
  successWrap: { textAlign: "center", padding: 80 },
  successIcon: { fontSize: 64, marginBottom: 16 },
};
