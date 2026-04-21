import { routes, normalizeRoute } from "./js/routes.js";
import { store, setUser, loadMockData } from "./js/store.js";
import { bindRouteSync } from "./js/nav.js";
import { mountShell } from "./js/shell.js";

const app = document.querySelector("#app");

function renderLogin() {
  app.innerHTML = `
    <main class="login-screen">
      <section class="login-copy">
        <p class="eyebrow">Internal Monitoring</p>
        <h1>Mining Operations Dashboard</h1>
        <p>One operating view for production, hauling, fleet health, safety, and maintenance across active sites.</p>
      </section>
      <section class="login-panel">
        <form class="login-form" id="loginForm">
          <p class="eyebrow">Secure Access</p>
          <h2>Sign in</h2>
          <label>
            Username
            <input class="input" name="username" value="ops.supervisor" autocomplete="username">
          </label>
          <label>
            Role
            <select class="select" name="role">
              <option>Operations Lead</option>
              <option>Safety Officer</option>
              <option>Maintenance Planner</option>
            </select>
          </label>
          <label>
            Password
            <input class="input" name="password" type="password" value="mining123" autocomplete="current-password">
          </label>
          <button class="primary-btn" type="submit">Enter Dashboard</button>
        </form>
      </section>
    </main>
  `;

  document.querySelector("#loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUser({
      name: form.get("username") || "operator",
      role: form.get("role") || "Operations Lead"
    });
    await fetchData();
  });
}

async function fetchData() {
  app.innerHTML = `<div class="empty-state">Loading mining operations data...</div>`;

  try {
    await loadMockData();
    const hashRoute = location.hash.replace("#/", "");
    store.route = normalizeRoute(routes[hashRoute] ? hashRoute : "dashboard", store.user.role);
    mountShell(app, renderLogin);
  } catch {
    renderError();
  }
}

function renderError() {
  app.innerHTML = `
    <main class="error-screen">
      <section class="card panel error-panel">
        <p class="eyebrow">Mock API Error</p>
        <h1>Dashboard belum bisa dimuat</h1>
        <p>${store.error}</p>
        <button class="primary-btn" id="retryBtn">Coba Lagi</button>
      </section>
    </main>
  `;
  document.querySelector("#retryBtn").addEventListener("click", fetchData);
}

bindRouteSync(() => mountShell(app, renderLogin));

if (store.user) {
  fetchData();
} else {
  renderLogin();
}
