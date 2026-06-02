import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { data, setUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const found = data.users.find(u => u.email === email && u.password === password);
    if (found) { setUser(found); setError(""); }
    else setError("Identifiant ou mot de passe incorrect.");
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>🗓️</div>
        <h1 style={styles.title}>GestionCongés</h1>
        <p style={styles.sub}>Connectez-vous à votre espace</p>
        <input style={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={styles.input} placeholder="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} onClick={handleLogin}>Se connecter</button>
      </div>
    </div>
  );
}

const styles = {
  bg: { minHeight: "100vh", background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" },
  card: { background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: "48px 40px", width: 380, boxShadow: "0 25px 60px rgba(0,0,0,0.4)" },
  logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title: { color: "#fff", textAlign: "center", margin: "0 0 4px", fontSize: 26, fontWeight: 700 },
  sub: { color: "rgba(255,255,255,0.5)", textAlign: "center", marginBottom: 32, fontSize: 14 },
  input: { width: "100%", padding: "12px 16px", marginBottom: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, boxSizing: "border-box", outline: "none" },
  btn: { width: "100%", padding: "14px", background: "linear-gradient(90deg, #00c6ff, #0072ff)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", marginTop: 4 },
  error: { color: "#ff6b6b", fontSize: 13, marginBottom: 8, textAlign: "center" },
};
