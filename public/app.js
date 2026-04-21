import { routes, getVisibleRoutes, normalizeRoute } from "./js/routes.js";
import { store, setUser, clearUser, loadMockData } from "./js/store.js";
import { drawProductionChart } from "./js/charts.js";
import { renderDashboard } from "./js/pages/dashboard.js";
import { renderFleet, unitModal } from "./js/pages/fleet.js";
import { renderProduction } from "./js/pages/production.js";
import { renderSafety } from "./js/pages/safety.js";
import { renderMaintenance } from "./js/pages/maintenance.js";

const app = document.querySelector("#app");

const pageRenderers = {
  dashboard: renderDashboard,
  fleet: renderFleet,
  production: renderProduction,
  safety: renderSafety,
  maintenance: renderMaintenance
};

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
    renderShell();
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

function renderShell() {
  const visibleRoutes = getVisibleRoutes(store.user.role);
  const nav = Object.entries(visibleRoutes)
    .map(([key, route]) => `
      <a href="#/${key}" class="${store.route === key ? "active" : ""}" data-route="${key}">
        <span>${route.icon}</span>
        <span>${route.label}</span>
      </a>
    `)
    .join("");

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">MD</div>
          <div>
            <div>MineDesk</div>
            <small>Operations Center</small>
          </div>
        </div>
        <nav class="nav">${nav}</nav>
      </aside>
      <header class="topbar">
        <input class="input search" id="globalSearch" placeholder="Search units, sites, incidents..." value="${store.search}">
        <div class="top-actions">
          <div class="notification-wrap">
            <button class="icon-btn" id="notificationBtn" title="Notifications" aria-expanded="${store.notificationsOpen}">N</button>
            ${renderNotifications()}
          </div>
          <button class="ghost-btn" id="logoutBtn">Logout</button>
          <div class="profile-chip">
            <span class="avatar">${store.user.name.slice(0, 2).toUpperCase()}</span>
            <span>${store.user.role}</span>
          </div>
        </div>
      </header>
      <main class="main" id="mainContent"></main>
    </div>
    <div class="modal-backdrop" id="unitModal"></div>
  `;

  bindShellEvents(visibleRoutes);
  renderPage();
}

function renderNotifications() {
  const notifications = store.data?.notifications || [];
  return `
    <div class="notification-menu ${store.notificationsOpen ? "open" : ""}">
      <div class="notification-head">
        <strong>Notifications</strong>
        <span>${notifications.length} new</span>
      </div>
      ${notifications.length ? notifications.map((item) => `
        <button class="notification-item" type="button">${item}</button>
      `).join("") : `<div class="empty-state">Tidak ada notifikasi baru.</div>`}
    </div>
  `;
}

function bindShellEvents(visibleRoutes) {
  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (!visibleRoutes[link.dataset.route]) return;
      store.route = link.dataset.route;
      store.notificationsOpen = false;
      history.pushState(null, "", `#/${store.route}`);
      renderShell();
    });
  });

  document.querySelector("#logoutBtn").addEventListener("click", () => {
    clearUser();
    renderLogin();
  });

  document.querySelector("#notificationBtn").addEventListener("click", () => {
    store.notificationsOpen = !store.notificationsOpen;
    renderShell();
  });

  document.querySelector("#globalSearch").addEventListener("input", (event) => {
    store.search = event.target.value;
    renderPage();
  });
}

function renderPage() {
  const main = document.querySelector("#mainContent");
  main.innerHTML = pageRenderers[store.route](store.data);
  afterRender();
}

function afterRender() {
  const chart = document.querySelector("#productionChart");
  if (chart) {
    drawProductionChart(chart, store.data.productionTrend);
  }

  const statusFilter = document.querySelector("#fleetStatus");
  const siteFilter = document.querySelector("#fleetSite");
  if (statusFilter) {
    statusFilter.addEventListener("change", (event) => {
      store.fleetStatus = event.target.value;
      renderPage();
    });
  }
  if (siteFilter) {
    siteFilter.addEventListener("change", (event) => {
      store.fleetSite = event.target.value;
      renderPage();
    });
  }

  document.querySelectorAll("[data-unit-id]").forEach((button) => {
    button.addEventListener("click", () => openUnitModal(button.dataset.unitId));
  });
}

function openUnitModal(unitId) {
  const unit = store.data.fleet.find((item) => item.id === unitId);
  const modal = document.querySelector("#unitModal");
  modal.innerHTML = unitModal(unit);
  modal.classList.add("open");
  document.querySelector("#closeModal").addEventListener("click", closeUnitModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeUnitModal();
  }, { once: true });
}

function closeUnitModal() {
  const modal = document.querySelector("#unitModal");
  modal.classList.remove("open");
  modal.innerHTML = "";
}

window.addEventListener("hashchange", () => {
  if (!store.user) return;
  const route = location.hash.replace("#/", "");
  const nextRoute = normalizeRoute(route, store.user.role);
  if (routes[nextRoute] && store.route !== nextRoute) {
    store.route = nextRoute;
    store.notificationsOpen = false;
    renderShell();
  }
});

if (store.user) {
  fetchData();
} else {
  renderLogin();
}
