import { useState } from "react";
import { useApp } from "../context/AppContext";

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const STATUS_COLOR = { "validé": "#22c55e", "en attente": "#f59e0b", "rejeté": "#ef4444" };

export default function Planning() {
  const { data, user } = useApp();
  const [selectedTeam, setSelectedTeam] = useState("all");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const filteredUsers = data.users.filter(u =>
    selectedTeam === "all" ? true : u.team === selectedTeam
  );

  const getRequestsForUserDay = (userId, day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return data.requests.filter(r =>
      r.userId === userId &&
      r.status !== "rejeté" &&
      r.dateStart <= dateStr &&
      r.dateEnd >= dateStr
    );
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📅 Planning des Congés</h2>
          <p style={styles.sub}>Vue consolidée de l'équipe</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select style={styles.select} value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option value="all">Toutes les équipes</option>
            {data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div style={styles.navMonth}>
            <button style={styles.navBtn} onClick={prevMonth}>‹</button>
            <span style={styles.monthLabel}>{MONTHS[month]} {year}</span>
            <button style={styles.navBtn} onClick={nextMonth}>›</button>
          </div>
        </div>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.nameCol }}>Collaborateur</th>
              {days.map(d => {
                const date = new Date(year, month, d);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return <th key={d} style={{ ...styles.th, ...styles.dayCol, background: isWeekend ? "#e2e8f0" : "#f8fafc", color: isWeekend ? "#94a3b8" : "#475569" }}>{d}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td style={styles.nameCell}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ ...styles.dot, background: u.team === "A" ? "#0072ff" : "#00c6ff" }}>{u.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{u.team ? `Équipe ${u.team}` : "Manager"}</div>
                    </div>
                  </div>
                </td>
                {days.map(d => {
                  const date = new Date(year, month, d);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  const reqs = getRequestsForUserDay(u.id, d);
                  const req = reqs[0];
                  return (
                    <td key={d} style={{ ...styles.dayCell, background: isWeekend ? "#f1f5f9" : "#fff" }} title={req ? `${req.type} — ${req.status}` : ""}>
                      {req && <div style={{ ...styles.badge, background: STATUS_COLOR[req.status] || "#94a3b8" }}>{req.type}</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.legend}>
        <span style={styles.legendItem}><span style={{ ...styles.dot2, background: "#22c55e" }} /> Validé</span>
        <span style={styles.legendItem}><span style={{ ...styles.dot2, background: "#f59e0b" }} /> En attente</span>
        <span style={styles.legendItem}><span style={{ ...styles.dot2, background: "#94a3b8" }} /> Week-end</span>
      </div>
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 0", color: "#64748b", fontSize: 14 },
  select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, background: "#fff", cursor: "pointer" },
  navMonth: { display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "6px 12px", border: "1px solid #e2e8f0" },
  navBtn: { background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#475569", padding: "0 4px" },
  monthLabel: { fontWeight: 600, color: "#1e293b", minWidth: 140, textAlign: "center" },
  tableWrap: { overflowX: "auto", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  table: { borderCollapse: "collapse", width: "100%", background: "#fff" },
  th: { padding: "8px 4px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: "center" },
  nameCol: { minWidth: 180, textAlign: "left", padding: "8px 16px", position: "sticky", left: 0, background: "#f8fafc", zIndex: 1 },
  dayCol: { width: 32, minWidth: 32 },
  nameCell: { padding: "10px 16px", borderBottom: "1px solid #f1f5f9", position: "sticky", left: 0, background: "#fff", zIndex: 1 },
  dayCell: { textAlign: "center", padding: "6px 2px", borderBottom: "1px solid #f1f5f9", borderRight: "1px solid #f8fafc" },
  badge: { borderRadius: 4, color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 3px", margin: "0 auto", display: "inline-block" },
  dot: { width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  legend: { display: "flex", gap: 20, marginTop: 16, fontSize: 13, color: "#64748b" },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
  dot2: { width: 10, height: 10, borderRadius: "50%", display: "inline-block" },
};
