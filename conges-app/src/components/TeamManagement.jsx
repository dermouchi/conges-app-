import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function TeamManagement() {
  const { data, setData } = useApp();
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("collaborateur");
  const [formTeam, setFormTeam] = useState("A");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [msg, setMsg] = useState("");

  const handleAdd = () => {
    if (!formName || !formEmail || !formPassword) return setMsg("Tous les champs sont obligatoires.");
    if (data.users.find(u => u.email === formEmail)) return setMsg("Email déjà utilisé.");
    const newUser = { id: Date.now(), name: formName, email: formEmail, password: formPassword, role: formRole, team: formTeam, cp: 25, rtt: 10 };
    setData(d => ({ ...d, users: [...d.users, newUser] }));
    setFormName(""); setFormEmail(""); setFormPassword(""); setFormRole("collaborateur"); setFormTeam("A");
    setMsg("✅ Collaborateur ajouté !");
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = (id) => {
    setData(d => ({ ...d, users: d.users.filter(u => u.id !== id) }));
    setConfirmDelete(null);
  };

  const handleTeamChange = (userId, newTeam) => {
    setData(d => ({ ...d, users: d.users.map(u => u.id === userId ? { ...u, team: newTeam } : u) }));
  };

  const collaborateurs = data.users.filter(u => u.role !== "manager");

  return (
    <div>
      <h2 style={styles.title}>👥 Gestion des Équipes</h2>
      <p style={styles.sub}>Ajouter, supprimer ou réorganiser les collaborateurs</p>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>➕ Ajouter un collaborateur</h3>
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Nom complet</label>
            <input style={styles.input} placeholder="Ex: Jean Dupont" value={formName} onChange={e => setFormName(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} placeholder="Ex: jean@company.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Mot de passe</label>
            <input style={styles.input} placeholder="Mot de passe" value={formPassword} onChange={e => setFormPassword(e.target.value)} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Rôle</label>
            <select style={styles.input} value={formRole} onChange={e => setFormRole(e.target.value)}>
              <option value="collaborateur">Collaborateur</option>
              <option value="lead">Responsable d'Équipe</option>
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Équipe</label>
            <select style={styles.input} value={formTeam} onChange={e => setFormTeam(e.target.value)}>
              {data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        {msg && <div style={styles.msg}>{msg}</div>}
        <button style={styles.btnAdd} onClick={handleAdd}>➕ Ajouter</button>
      </div>

      {/* Liste tous les collaborateurs */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>👤 Tous les collaborateurs ({collaborateurs.length})</h3>
        <div style={styles.list}>
          {collaborateurs.length === 0 && <div style={styles.empty}>Aucun collaborateur</div>}
          {collaborateurs.map(u => (
            <div key={u.id} style={styles.userCard}>
              <div style={styles.avatar}>{u.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={styles.name}>{u.name}</div>
                <div style={styles.email}>{u.email} · {u.role}</div>
              </div>
              <select style={styles.teamSelect} value={u.team || ""} onChange={e => handleTeamChange(u.id, e.target.value)}>
                {data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {confirmDelete === u.id ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={styles.btnDanger} onClick={() => handleDelete(u.id)}>Confirmer</button>
                  <button style={styles.btnGhost} onClick={() => setConfirmDelete(null)}>Non</button>
                </div>
              ) : (
                <button style={styles.btnGhost} onClick={() => setConfirmDelete(u.id)}>🗑️ Supprimer</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Par équipe */}
      {data.teams.map(team => (
        <div key={team.id} style={styles.section}>
          <h3 style={styles.sectionTitle}>🏷️ {team.name} ({collaborateurs.filter(u => u.team === team.id).length} membres)</h3>
          <div style={styles.list}>
            {collaborateurs.filter(u => String(u.team) === String(team.id)).map(u => (
              <div key={u.id} style={styles.userCard}>
                <div style={styles.avatar}>{u.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={styles.name}>{u.name}</div>
                  <div style={styles.email}>{u.email}</div>
                </div>
              </div>
            ))}
            {collaborateurs.filter(u => String(u.team) === String(team.id)).length === 0 && (
              <div style={styles.empty}>Aucun membre</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 24px", color: "#64748b", fontSize: 14 },
  section: { background: "#fff", borderRadius: 14, padding: 24, marginBottom: 20, border: "1px solid #e2e8f0" },
  sectionTitle: { margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#374151" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 12, fontWeight: 600, color: "#64748b" },
  input: { padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" },
  btnAdd: { padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(90deg, #0072ff, #00c6ff)", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  msg: { marginBottom: 10, fontSize: 14, color: "#16a34a", fontWeight: 600 },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  userCard: { display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #f1f5f9" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #0072ff, #00c6ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  name: { fontWeight: 600, fontSize: 14, color: "#1e293b" },
  email: { fontSize: 12, color: "#94a3b8" },
  teamSelect: { padding: "6px 10px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff" },
  btnDanger: { padding: "6px 12px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  btnGhost: { padding: "6px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" },
  empty: { color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 16 },
};
