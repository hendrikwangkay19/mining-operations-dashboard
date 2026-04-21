import { getVisibleRoutes } from "./routes.js";
import { bindNavEvents, renderNav } from "./nav.js";
import { bindNotificationToggle, renderNotifications } from "./notifications.js";
import { bindFleetInteractions } from "./fleet-interactions.js";
import { store, clearUser } from "./store.js";
import { drawProductionChart } from "./charts.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderFleet } from "./pages/fleet.js";
import { renderProduction } from "./pages/production.js";
import { renderSafety } from "./pages/safety.js";
import { renderMaintenance } from "./pages/maintenance.js";
import { renderReports } from "./pages/reports.js";
import { renderSettings } from "./pages/settings.js";

const pageRenderers = {
  dashboard: renderDashboard,
  fleet: renderFleet,
  production: renderProduction,
  safety: renderSafety,
  maintenance: renderMaintenance,
  reports: renderReports,
  settings: renderSettings
};

let rootElement;
let loginRenderer;

export function mountShell(app, onLogoutRender) {
  rootElement = app;
  loginRenderer = onLogoutRender;
  renderShell();
}

function renderShell() {
  const visibleRoutes = getVisibleRoutes(store.user.role);

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
        <nav class="nav">${renderNav(visibleRoutes)}</nav>
      </aside>
      <header class="topbar">
        <input class="input search" id="globalSearch" placeholder="Search units, sites, alerts..." value="${store.search}" aria-label="Search dashboard data">
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

function bindShellEvents(visibleRoutes) {
  bindNavEvents(visibleRoutes, renderShell);
  bindNotificationToggle(renderShell);

  document.querySelector("#logoutBtn").addEventListener("click", () => {
    clearUser();
    loginRenderer();
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

  bindFleetInteractions(renderPage);
}
