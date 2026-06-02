const BASE = "http://localhost:3001/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur serveur");
  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    fetch(BASE + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  // Users
  getUsers:   ()           => request("GET",    "/users"),
  addUser:    (data)       => request("POST",   "/users", data),
  updateUser: (id, data)   => request("PUT",    `/users/${id}`, data),
  deleteUser: (id)         => request("DELETE", `/users/${id}`),

  // Teams
  getTeams:   ()           => request("GET",    "/teams"),
  updateTeam: (id, data)   => request("PUT",    `/teams/${id}`, data),

  // Requests
  getRequests:    ()           => request("GET",    "/requests"),
  addRequest:     (data)       => request("POST",   "/requests", data),
  updateRequest:  (id, data)   => request("PUT",    `/requests/${id}`, data),
  deleteRequest:  (id)         => request("DELETE", `/requests/${id}`),

  // Notifications
  getNotifications: ()    => request("GET", "/notifications"),
  markAllRead:      ()    => request("PUT", "/notifications/read-all"),
};