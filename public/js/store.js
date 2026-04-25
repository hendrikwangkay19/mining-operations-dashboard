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

export function setSidebarCollapsed(val) {
  store.sidebarCollapsed = val;
  localStorage.setItem("sidebarCollapsed", JSON.stringify(val));
}

export function setFleetView(view) {
  store.fleetView = view;
  localStorage.setItem("fleetView", view);
}

export async function loadMockData() {
  store.error = "";
  try {
    const response = await fetch("/api/mock-data");
    if (!response.ok) throw new Error(`Mock API returned ${response.status}`);
    store.data = await response.json();
    return store.data;
  } catch (error) {
    store.data = null;
    store.error = "Data operasional belum bisa dimuat. Cek server mock API lalu coba lagi.";
    console.error(error);
    throw error;
  }
}
