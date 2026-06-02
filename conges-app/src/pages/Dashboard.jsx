import { useState } from "react";
import { useApp } from "../context/AppContext";
import Planning from "../components/Planning";
import MyRequests from "../components/MyRequests";
import NewRequest from "../components/NewRequest";
import Validation from "../components/Validation";
import TeamManagement from "../components/TeamManagement";
import Reporting from "../components/Reporting";
import { AbsenceRules } from "../components/Reporting";
import { LeaveCounters } from "../components/Reporting";
import Profile from "../components/Profile";

const navItems = (role) => {
  const all = [
    { key: "planning", label: "Planning", icon: "📅" },
    { key: "my-requests", label: "Mes Congés", icon: "📋" },
    { key: "new-request", label: "Nouvelle Demande", icon: "➕" },
  ];
  if (role === "manager" || role === "lead") {
    all.push({ key: "validation", label: "Validation", icon: "✅" });
  }
  if (role === "manager") {
    all.push({ key: "team", label: "Équipes", icon: "👥" });
    all.push({ key: "rules", label: "Règles Absences", icon: "⚙️" });
    all.push({ key: "counters", label: "Compteurs", icon: "🔢" });
    all.push({ key: "reporting", label: "Reporting", icon: "📊" });
  }
  all.push({ key: "profile", label: "Mon Profil", icon: "👤" });
  return all;
};

export default function Dashboard() {
  const { user, setUser } = useApp();
  const [active, setActive] = useState("planning");

  const renderView = () => {
    switch (active) {
      case "planning": return <Planning />;
      case "my-requests": return <MyRequests />;
      case "new-request": return <NewRequest onDone={() => setActive("my-requests")} />;
      case "validation": return <Validation />;
      case "team": return <TeamManagement />;
      case "rules": return <AbsenceRules />;
      case "counters": return <LeaveCounters />;
      case "reporting": return <Reporting />;
      case "profile": return <Profile />;
      default: return <Planning />;
    }
  };

  const roleLabel = { manager: "Manager", lead: "Responsable d'Équipe", collaborateur: "Collaborateur" };

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>🗓 GestionCongés</div>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user.name[0]}</div>
          <div>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userRole}>{roleLabel[user.role]}</div>
          </div>
        </div>
        <nav style={styles.nav}>
          {navItems(user.role).map(item => (
            <button
              key={item.key}
              style={{ ...styles.navBtn, ...(active === item.key ? styles.navBtnActive : {}) }}
              onClick={() => setActive(item.key)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>
        <button style={styles.logout} onClick={() => setUser(null)}>🚪 Déconnexion</button>
      </aside>

      <main style={styles.main}>
        {renderView()}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f0f4f8" },
  sidebar: { width: 240, background: "linear-gradient(180deg, #0f2027, #203a43)", display: "flex", flexDirection: "column", padding: "24px 16px", gap: 8, position: "fixed", height: "100vh", overflowY: "auto" },
  brand: { color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 24, letterSpacing: 0.5 },
  userInfo: { display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 12px", marginBottom: 20 },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #00c6ff, #0072ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 },
  userName: { color: "#fff", fontSize: 13, fontWeight: 600 },
  userRole: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  nav: { display: "flex", flexDirection: "column", gap: 4, flex: 1 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s" },
  navBtnActive: { background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 600 },
  logout: { marginTop: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", textAlign: "left" },
  main: { marginLeft: 240, flex: 1, padding: 32, overflowY: "auto" },
};
