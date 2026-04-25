export const store = {
  user:              JSON.parse(localStorage.getItem("miningUser")      || "null"),
  sidebarCollapsed:  JSON.parse(localStorage.getItem("sidebarCollapsed") || "false"),
  fleetView:         localStorage.getItem("fleetView") || "grid",
  data:              null,
  error:             "",
  route:             "dashboard",
  search:            "",
  fleetStatus:       "All",
  fleetSite:         "All",
  notificationsOpen: false,
};

export function setUser(user) {
  store.user = user;
  localStorage.setItem("miningUser", JSON.stringify(user));
}

export function clearUser() {
  store.user = null;
  localStorage.removeItem("miningUser");
}

export function getToken() {
  return localStorage.getItem("miningToken");
}

export function setToken(token) {
  localStorage.setItem("miningToken", token);
}

export function clearToken() {
  localStorage.removeItem("miningToken");
}

export function setSidebarCollapsed(val) {
  store.sidebarCollapsed = val;
  localStorage.setItem("sidebarCollapsed", JSON.stringify(val));
}

export function setFleetView(view) {
  store.fleetView = view;
  localStorage.setItem("fleetView", view);
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    clearUser();
    clearToken();
    location.reload();
    throw new Error("Session expired");
  }

  return res;
}

export async function loadDashboardData() {
  store.error = "";
  try {
    const res = await apiFetch("/api/dashboard");
    if (!res.ok) throw new Error(`Dashboard API returned ${res.status}`);
    store.data = await res.json();
    return store.data;
  } catch (error) {
    store.data = null;
    store.error = "Data operasional belum bisa dimuat. Pastikan server berjalan lalu coba lagi.";
    console.error(error);
    throw error;
  }
}
