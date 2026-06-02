const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database.cjs");

const app = express();
const PORT = 3001;
const SECRET = "conges_secret_key_2026";

app.use(cors());
app.use(express.json());

// ─── Middleware: التحقق من التوكن ───────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Non autorisé" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token invalide" });
  }
}

// ─── AUTH ────────────────────────────────────────────────────────────────────
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Email ou mot de passe incorrect" });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "8h" });
  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

// ─── USERS ───────────────────────────────────────────────────────────────────
app.get("/api/users", auth, (req, res) => {
  const users = db.prepare("SELECT id,name,email,role,team,cp,rtt FROM users").all();
  res.json(users);
});

app.post("/api/users", auth, (req, res) => {
  const { name, email, password, role, team } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Nom et email requis" });
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(400).json({ error: "Email déjà utilisé" });
  const hash = bcrypt.hashSync(password || "1234", 10);
  const result = db.prepare(
    "INSERT INTO users (name,email,password,role,team,cp,rtt) VALUES (?,?,?,?,?,25,10)"
  ).run(name, email, hash, role || "collaborateur", team || null);
  const user = db.prepare("SELECT id,name,email,role,team,cp,rtt FROM users WHERE id=?").get(result.lastInsertRowid);
  res.json(user);
});

app.put("/api/users/:id", auth, (req, res) => {
  const { name, team, role, cp, rtt } = req.body;
  db.prepare("UPDATE users SET name=COALESCE(?,name), team=COALESCE(?,team), role=COALESCE(?,role), cp=COALESCE(?,cp), rtt=COALESCE(?,rtt) WHERE id=?")
    .run(name, team, role, cp, rtt, req.params.id);
  const user = db.prepare("SELECT id,name,email,role,team,cp,rtt FROM users WHERE id=?").get(req.params.id);
  res.json(user);
});

app.delete("/api/users/:id", auth, (req, res) => {
  db.prepare("DELETE FROM users WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

// ─── TEAMS ───────────────────────────────────────────────────────────────────
app.get("/api/teams", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM teams").all());
});

app.put("/api/teams/:id", auth, (req, res) => {
  const { maxAbsents } = req.body;
  db.prepare("UPDATE teams SET maxAbsents=? WHERE id=?").run(maxAbsents, req.params.id);
  res.json(db.prepare("SELECT * FROM teams WHERE id=?").get(req.params.id));
});

// ─── REQUESTS ────────────────────────────────────────────────────────────────
app.get("/api/requests", auth, (req, res) => {
  res.json(db.prepare("SELECT * FROM requests ORDER BY id DESC").all());
});

app.post("/api/requests", auth, (req, res) => {
  const { type, dateStart, dateEnd, days } = req.body;
  const userId = req.user.id;
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(userId);

  // فحص الرصيد
  const balance = type === "CP" ? user.cp : user.rtt;
  if (days > balance) return res.status(400).json({ error: `Solde insuffisant (${balance}j restants)` });

  // فحص قواعد الفريق
  if (user.team) {
    const team = db.prepare("SELECT * FROM teams WHERE id=?").get(user.team);
    const teamMembers = db.prepare("SELECT id FROM users WHERE team=?").all(user.team).map(u => u.id);
    const overlap = db.prepare(
      `SELECT COUNT(*) as cnt FROM requests WHERE userId IN (${teamMembers.map(()=>"?").join(",")})
       AND userId != ? AND status NOT IN ('rejeté','annulé')
       AND dateStart <= ? AND dateEnd >= ?`
    ).get(...teamMembers, userId, dateEnd, dateStart);
    if (overlap.cnt >= team.maxAbsents)
      return res.status(400).json({ error: `Règle équipe: max ${team.maxAbsents} absent(s) simultané(s)` });
  }

  const result = db.prepare(
    "INSERT INTO requests (userId,type,dateStart,dateEnd,days,status,createdAt) VALUES (?,?,?,?,?,'en attente',?)"
  ).run(userId, type, dateStart, dateEnd, days, new Date().toISOString().split("T")[0]);

  // تحديث الرصيد
  const field = type === "CP" ? "cp" : "rtt";
  db.prepare(`UPDATE users SET ${field}=${field}-? WHERE id=?`).run(days, userId);

  // إشعار للمدراء
  const managers = db.prepare("SELECT id FROM users WHERE role IN ('manager','lead')").all();
  const msg = `${user.name} a soumis une demande de ${type} (${dateStart} → ${dateEnd})`;
  const notifStmt = db.prepare("INSERT INTO notifications (userId,message,read,createdAt) VALUES (?,?,0,?)");
  const now = new Date().toISOString();
  managers.forEach(m => notifStmt.run(m.id, msg, now));

  res.json(db.prepare("SELECT * FROM requests WHERE id=?").get(result.lastInsertRowid));
});

app.put("/api/requests/:id", auth, (req, res) => {
  const { status, type, dateStart, dateEnd, days } = req.body;
  const request = db.prepare("SELECT * FROM requests WHERE id=?").get(req.params.id);
  if (!request) return res.status(404).json({ error: "Demande introuvable" });

  if (status) {
    // الموافقة أو الرفض
    db.prepare("UPDATE requests SET status=? WHERE id=?").run(status, req.params.id);
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(request.userId);
    const statusLabel = status === "validé" ? "approuvée" : "rejetée";
    const msg = `Votre demande de ${request.type} (${request.dateStart} → ${request.dateEnd}) a été ${statusLabel}`;
    db.prepare("INSERT INTO notifications (userId,message,read,createdAt) VALUES (?,?,0,?)").run(request.userId, msg, new Date().toISOString());

    // إذا رُفض — نعيد الرصيد
    if (status === "rejeté") {
      const field = request.type === "CP" ? "cp" : "rtt";
      db.prepare(`UPDATE users SET ${field}=${field}+? WHERE id=?`).run(request.days, request.userId);
    }
  } else if (type && dateStart && dateEnd && days) {
    // التعديل — فقط إن كان "en attente"
    if (request.status !== "en attente") return res.status(400).json({ error: "Impossible de modifier une demande traitée" });
    const user = db.prepare("SELECT * FROM users WHERE id=?").get(request.userId);
    // نعيد الرصيد القديم ثم نطرح الجديد
    const oldField = request.type === "CP" ? "cp" : "rtt";
    const newField = type === "CP" ? "cp" : "rtt";
    db.prepare(`UPDATE users SET ${oldField}=${oldField}+? WHERE id=?`).run(request.days, request.userId);
    const newBalance = db.prepare(`SELECT ${newField} FROM users WHERE id=?`).get(request.userId)[newField];
    if (days > newBalance) {
      db.prepare(`UPDATE users SET ${oldField}=${oldField}-? WHERE id=?`).run(request.days, request.userId);
      return res.status(400).json({ error: `Solde insuffisant (${newBalance}j restants)` });
    }
    db.prepare(`UPDATE users SET ${newField}=${newField}-? WHERE id=?`).run(days, request.userId);
    db.prepare("UPDATE requests SET type=?,dateStart=?,dateEnd=?,days=? WHERE id=?").run(type, dateStart, dateEnd, days, req.params.id);
  }

  res.json(db.prepare("SELECT * FROM requests WHERE id=?").get(req.params.id));
});

app.delete("/api/requests/:id", auth, (req, res) => {
  const request = db.prepare("SELECT * FROM requests WHERE id=?").get(req.params.id);
  if (!request) return res.status(404).json({ error: "Introuvable" });
  if (request.status === "validé") return res.status(400).json({ error: "Impossible d'annuler une demande validée" });
  // نعيد الرصيد
  const field = request.type === "CP" ? "cp" : "rtt";
  db.prepare(`UPDATE users SET ${field}=${field}+? WHERE id=?`).run(request.days, request.userId);
  db.prepare("DELETE FROM requests WHERE id=?").run(req.params.id);
  res.json({ success: true });
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
app.get("/api/notifications", auth, (req, res) => {
  const notifs = db.prepare("SELECT * FROM notifications WHERE userId=? ORDER BY id DESC LIMIT 20").all(req.user.id);
  res.json(notifs);
});

app.put("/api/notifications/read-all", auth, (req, res) => {
  db.prepare("UPDATE notifications SET read=1 WHERE userId=?").run(req.user.id);
  res.json({ success: true });
});

// ─── START ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});