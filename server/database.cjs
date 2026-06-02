const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new Database(path.join(__dirname, "conges.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'collaborateur',
    team TEXT,
    cp INTEGER DEFAULT 25,
    rtt INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    maxAbsents INTEGER DEFAULT 2
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    dateStart TEXT NOT NULL,
    dateEnd TEXT NOT NULL,
    days INTEGER NOT NULL,
    status TEXT DEFAULT 'en attente',
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// إدخال البيانات الأولية إذا كانت قاعدة البيانات فارغة
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  // إدخال الفرق
  db.prepare("INSERT INTO teams (id, name, maxAbsents) VALUES (?, ?, ?)").run("A", "Équipe A", 2);
  db.prepare("INSERT INTO teams (id, name, maxAbsents) VALUES (?, ?, ?)").run("B", "Équipe B", 1);

  // إدخال المستخدمين مع تشفير كلمات المرور
  const hash = (p) => bcrypt.hashSync(p, 10);
  const insert = db.prepare(
    "INSERT INTO users (name, email, password, role, team, cp, rtt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  insert.run("Ahmed Benali",  "ahmed@company.com",  hash("1234"), "manager",       null, 25, 10);
  insert.run("Sara Dupont",   "sara@company.com",   hash("1234"), "lead",          "A",  25, 10);
  insert.run("Karim Martin",  "karim@company.com",  hash("1234"), "collaborateur", "A",  20,  8);
  insert.run("Leila Bernard", "leila@company.com",  hash("1234"), "collaborateur", "B",  18,  6);
  insert.run("Youssef Petit", "youssef@company.com",hash("1234"), "collaborateur", "B",  22,  9);

  // إدخال طلبات تجريبية
  const req = db.prepare(
    "INSERT INTO requests (userId, type, dateStart, dateEnd, days, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  req.run(3, "CP",  "2026-06-10", "2026-06-15", 5, "en attente", "2026-06-01");
  req.run(4, "RTT", "2026-06-20", "2026-06-20", 1, "validé",     "2026-05-28");
  req.run(5, "CP",  "2026-07-01", "2026-07-05", 4, "rejeté",     "2026-05-25");
}

module.exports = db;