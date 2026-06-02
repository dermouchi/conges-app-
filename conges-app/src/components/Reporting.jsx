import { useApp } from "../context/AppContext";
import { useState } from "react";

export function AbsenceRules() {
  const { data, setData } = useApp();
  const [msg, setMsg] = useState("");

  const updateMax = (teamId, val) => {
    setData(d => ({ ...d, teams: d.teams.map(t => t.id === teamId ? { ...t, maxAbsents: Number(val) } : t) }));
    setMsg("✅ Règles mises à jour !");
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div>
      <h2 style={s.title}>⚙️ Règles d'Absences par Équipe</h2>
      <p style={s.sub}>Définir le nombre maximum d'absents simultanés par équipe</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
        {data.teams.map(team => (
          <div key={team.id} style={s.card}>
            <div>
              <div style={s.teamName}>{team.name}</div>
              <div style={s.teamSub}>{data.users.filter(u => u.team === team.id).length} membres</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={s.label}>Max absents simultanés :</span>
              <input type="number" min={1} max={20} style={s.numInput} value={team.maxAbsents}
                onChange={e => updateMax(team.id, e.target.value)} />
            </div>
          </div>
        ))}
      </div>
      {msg && <div style={s.msg}>{msg}</div>}
    </div>
  );
}

export function LeaveCounters() {
  const { data, setData } = useApp();
  const [msg, setMsg] = useState("");

  const update = (userId, field, val) => {
    setData(d => ({ ...d, users: d.users.map(u => u.id === userId ? { ...u, [field]: Number(val) } : u) }));
  };

  const resetAll = (type) => {
    setData(d => ({
      ...d,
      users: d.users.map(u => ({ ...u, [type === "CP" ? "cp" : "rtt"]: type === "CP" ? 25 : 10 })),
    }));
    setMsg(`✅ Compteurs ${type} réinitialisés !`);
    setTimeout(() => setMsg(""), 2500);
  };

  return (
    <div>
      <h2 style={s.title}>🔢 Gestion des Compteurs de Congés</h2>
      <p style={s.sub}>CP (réinitialisation fin juin) · RTT (réinitialisation fin décembre)</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button style={s.btnReset} onClick={() => resetAll("CP")}>🔄 Réinitialiser CP (fin juin)</button>
        <button style={s.btnReset} onClick={() => resetAll("RTT")}>🔄 Réinitialiser RTT (fin déc.)</button>
      </div>
      {msg && <div style={s.msg}>{msg}</div>}
      <div style={s.table}>
        <div style={s.tableHead}>
          <span style={{ flex: 2 }}>Collaborateur</span>
          <span style={{ flex: 1, textAlign: "center" }}>Équipe</span>
          <span style={{ flex: 1, textAlign: "center" }}>CP restants</span>
          <span style={{ flex: 1, textAlign: "center" }}>RTT restants</span>
        </div>
        {data.users.map(u => (
          <div key={u.id} style={s.tableRow}>
            <span style={{ flex: 2, fontWeight: 600 }}>{u.name}</span>
            <span style={{ flex: 1, textAlign: "center", color: "#94a3b8" }}>{u.team || "—"}</span>
            <span style={{ flex: 1, textAlign: "center" }}>
              <input type="number" style={s.counterInput} value={u.cp} onChange={e => update(u.id, "cp", e.target.value)} />
            </span>
            <span style={{ flex: 1, textAlign: "center" }}>
              <input type="number" style={s.counterInput} value={u.rtt} onChange={e => update(u.id, "rtt", e.target.value)} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reporting() {
  const { data } = useApp();

  const total = data.requests.length;
  const validated = data.requests.filter(r => r.status === "validé").length;
  const pending = data.requests.filter(r => r.status === "en attente").length;
  const rejected = data.requests.filter(r => r.status === "rejeté").length;
  const totalDays = data.requests.filter(r => r.status === "validé").reduce((acc, r) => acc + r.days, 0);

  const byTeam = data.teams.map(team => {
    const members = data.users.filter(u => u.team === team.id).map(u => u.id);
    const reqs = data.requests.filter(r => members.includes(r.userId) && r.status === "validé");
    return { team: team.name, count: reqs.length, days: reqs.reduce((a, r) => a + r.days, 0) };
  });

  const byUser = data.users.map(u => {
    const reqs = data.requests.filter(r => r.userId === u.id && r.status === "validé");
    return { name: u.name, count: reqs.length, days: reqs.reduce((a, r) => a + r.days, 0) };
  }).sort((a, b) => b.days - a.days);

  return (
    <div>
      <h2 style={s.title}>📊 Reporting des Congés</h2>
      <p style={s.sub}>Indicateurs et statistiques globaux</p>

      <div style={s.kpiRow}>
        {[
          { label: "Total demandes", val: total, color: "#0072ff" },
          { label: "Validées", val: validated, color: "#22c55e" },
          { label: "En attente", val: pending, color: "#f59e0b" },
          { label: "Rejetées", val: rejected, color: "#ef4444" },
          { label: "Jours validés", val: totalDays, color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} style={s.kpi}>
            <div style={{ ...s.kpiVal, color: k.color }}>{k.val}</div>
            <div style={s.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Par équipe</h3>
          {byTeam.map(t => (
            <div key={t.team} style={s.row}>
              <span style={s.rowLabel}>{t.team}</span>
              <span>{t.count} demandes · {t.days}j</span>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <h3 style={s.cardTitle}>Par collaborateur (top)</h3>
          {byUser.slice(0, 5).map(u => (
            <div key={u.name} style={s.row}>
              <span style={s.rowLabel}>{u.name}</span>
              <span>{u.count} demandes · {u.days}j</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 24px", color: "#64748b", fontSize: 14 },
  card: { background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e2e8f0" },
  teamName: { fontWeight: 700, fontSize: 15, color: "#1e293b" },
  teamSub: { fontSize: 12, color: "#94a3b8" },
  label: { fontSize: 14, color: "#374151" },
  numInput: { width: 60, padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 15, fontWeight: 700, textAlign: "center" },
  msg: { marginTop: 16, fontSize: 14, color: "#16a34a" },
  btnReset: { padding: "10px 18px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, cursor: "pointer", fontWeight: 600, color: "#374151" },
  table: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "hidden" },
  tableHead: { display: "flex", padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: 13, color: "#64748b" },
  tableRow: { display: "flex", padding: "12px 20px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: 14, color: "#1e293b" },
  counterInput: { width: 60, padding: "4px 8px", borderRadius: 8, border: "1px solid #e2e8f0", textAlign: "center", fontSize: 14, fontWeight: 600 },
  kpiRow: { display: "flex", gap: 16 },
  kpi: { background: "#fff", borderRadius: 14, padding: "20px 24px", border: "1px solid #e2e8f0", flex: 1, textAlign: "center" },
  kpiVal: { fontSize: 32, fontWeight: 800 },
  kpiLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  cardTitle: { margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#374151" },
  row: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14, color: "#374151" },
  rowLabel: { fontWeight: 600 },
};

export default Reporting;
