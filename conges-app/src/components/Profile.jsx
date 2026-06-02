import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Profile() {
  const { data, setData, user, setUser } = useApp();
  const currentUser = data.users.find(u => u.id === user.id);
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [msg, setMsg] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setData(d => ({ ...d, users: d.users.map(u => u.id === user.id ? { ...u, avatar: reader.result } : u) }));
      setUser(u => ({ ...u, avatar: reader.result }));
      setMsg("✅ Photo mise à jour !");
      setTimeout(() => setMsg(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  const roleLabel = { manager: "Manager", lead: "Responsable d'Équipe", collaborateur: "Collaborateur" };

  return (
    <div>
      <h2 style={s.title}>👤 Mon Profil</h2>
      <p style={s.sub}>Informations de votre compte</p>

      {msg && <div style={s.msg}>{msg}</div>}

      <div style={s.section}>
        <div style={s.profileRow}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>
              {avatar
                ? <img src={avatar} alt="avatar" style={s.avatarImg} />
                : <span style={s.avatarLetter}>{currentUser?.name?.[0] || "A"}</span>
              }
            </div>
            <input type="file" accept="image/*" id="av" style={{ display: "none" }} onChange={handleImageChange} />
            <label htmlFor="av" style={s.btnUp}>📷 Changer la photo</label>
            {avatar && <button style={s.btnRm} onClick={() => { setAvatar(""); setData(d => ({ ...d, users: d.users.map(u => u.id === user.id ? { ...u, avatar: "" } : u) })); }}>Supprimer</button>}
          </div>
          <div style={s.info}>
            <div style={s.name}>{currentUser?.name}</div>
            <div style={s.email}>{currentUser?.email}</div>
            <div style={s.tag}>{roleLabel[currentUser?.role]}</div>
            {currentUser?.team && <div style={s.team}>Équipe {currentUser.team}</div>}
          </div>
        </div>
      </div>

      <div style={s.section}>
        <h3 style={s.sectionTitle}>Mes compteurs</h3>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={s.counter}><span style={s.cVal}>{currentUser?.cp}</span><span style={s.cLabel}>CP restants</span></div>
          <div style={s.counter}><span style={s.cVal}>{currentUser?.rtt}</span><span style={s.cLabel}>RTT restants</span></div>
          <div style={s.counter}><span style={s.cVal}>{data.requests.filter(r => r.userId === user.id && r.status === "validé").length}</span><span style={s.cLabel}>Congés validés</span></div>
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#1e293b" },
  sub: { margin: "4px 0 24px", color: "#64748b", fontSize: 14 },
  msg: { padding: "12px 16px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: 16, fontSize: 14, fontWeight: 600, color: "#16a34a" },
  section: { background: "#fff", borderRadius: 14, padding: 24, marginBottom: 20, border: "1px solid #e2e8f0" },
  sectionTitle: { margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#374151" },
  profileRow: { display: "flex", alignItems: "center", gap: 32 },
  avatarWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  avatar: { width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #0072ff, #00c6ff)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarLetter: { color: "#fff", fontWeight: 700, fontSize: 36 },
  btnUp: { display: "inline-block", padding: "8px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  btnRm: { padding: "6px 12px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff", color: "#ef4444", fontSize: 12, cursor: "pointer" },
  info: { display: "flex", flexDirection: "column", gap: 6 },
  name: { fontSize: 22, fontWeight: 700, color: "#1e293b" },
  email: { fontSize: 14, color: "#64748b" },
  tag: { background: "#eff6ff", color: "#0072ff", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-block" },
  team: { fontSize: 13, color: "#94a3b8" },
  counter: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 24px", textAlign: "center", minWidth: 100 },
  cVal: { display: "block", fontSize: 28, fontWeight: 800, color: "#0072ff" },
  cLabel: { fontSize: 12, color: "#64748b" },
};
