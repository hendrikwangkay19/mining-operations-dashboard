import { routes, getVisibleRoutes, normalizeRoute } from "./routes.js";
import { store, clearUser } from "./store.js";
import { drawProductionChart } from "./charts.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderFleet, unitModal } from "./pages/fleet.js";
import { renderProduction } from "./pages/production.js";
import { renderSafety } from "./pages/safety.js";
import { renderMaintenance } from "./pages/maintenance.js";

const pageRenderers = {
  dashboard: renderDashboard,
  fleet: renderFleet,
  production: renderProduction,
  safety: renderSafety,
  maintenance: renderMaintenance
};

let rootElement;
let loginRenderer;

export function mountShell(app, onLogoutRender) {
  rootElement = app;
  loginRenderer = onLogoutRender;
  renderShell();
}

export function bindRouteSync() {
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

  rootElement.innerHTML = `
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
    loginRenderer();
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
