import { getVisibleRoutes } from "./routes.js";
import { bindNavEvents, renderNav } from "./nav.js";
import { bindNotificationToggle, renderNotifications } from "./notifications.js";
import { bindFleetInteractions } from "./fleet-interactions.js";
import { store, clearUser, clearToken, setSidebarCollapsed } from "./store.js";
import { drawProductionChart } from "./charts.js";
import { renderDashboard } from "./pages/dashboard.js";
import { renderFleet } from "./pages/fleet.js";
import { renderProduction } from "./pages/production.js";
import { renderSafety } from "./pages/safety.js";
import { renderMaintenance } from "./pages/maintenance.js";
import { renderReports } from "./pages/reports.js";
import { renderSettings } from "./pages/settings.js";

const pageRenderers = {
  dashboard: renderDashboard, fleet: renderFleet, production: renderProduction,
  safety: renderSafety, maintenance: renderMaintenance, reports: renderReports, settings: renderSettings,
};

let rootEl, loginRender;

const chevronLeftIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
const hamburgerIcon   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
const logoutIcon      = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

export function mountShell(app, onLogoutRender) {
  rootEl = app;
  loginRender = onLogoutRender;
  renderShell();
}

function renderShell() {
  const visibleRoutes = getVisibleRoutes(store.user.role);
  const collapsed = store.sidebarCollapsed;
  const currentRoute = visibleRoutes[store.route] || visibleRoutes["dashboard"];
  const initials = store.user.name.slice(0, 2).toUpperCase();

  rootEl.innerHTML = `
    <div class="app-shell" ${collapsed ? 'data-collapsed="true"' : ""}>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">MD</div>
          <div class="brand-text">
            <div class="brand-name">MineDesk</div>
            <div class="brand-sub">Operations Center</div>
          </div>
        </div>
        <div class="nav-section">Navigation</div>
        <nav class="nav" id="mainNav">${renderNav(visibleRoutes)}</nav>
        <button class="sidebar-toggle" id="sidebarToggle" title="${collapsed ? "Expand sidebar" : "Collapse sidebar"}">
          ${chevronLeftIcon}
          <span class="nav-label" style="font-size:12px;font-weight:600">${collapsed ? "" : "Collapse"}</span>
        </button>
      </aside>

      <header class="topbar">
        <button class="hamburger" id="hamburgerBtn" aria-label="Open navigation">${hamburgerIcon}</button>
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <span>MineDesk</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">${currentRoute ? currentRoute.label : "Dashboard"}</span>
        </nav>
        <input class="input search" id="globalSearch" placeholder="Search units, sites, alerts…" value="${store.search}" aria-label="Search">
        <div class="top-actions">
          <div class="notification-wrap">${renderNotifications()}</div>
          <button class="ghost-btn" id="logoutBtn">${logoutIcon} Logout</button>
          <div class="profile-chip">
            <span class="avatar">${initials}</span>
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

  /* Logout */
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    clearUser();
    clearToken();
    loginRender();
  });

  /* Search */
  document.querySelector("#globalSearch").addEventListener("input", (e) => {
    store.search = e.target.value;
    renderPage();
  });

  /* Sidebar collapse toggle */
  document.querySelector("#sidebarToggle").addEventListener("click", () => {
    setSidebarCollapsed(!store.sidebarCollapsed);
    renderShell();
  });

  /* Mobile hamburger */
  document.querySelector("#hamburgerBtn").addEventListener("click", () => {
    const shell = document.querySelector(".app-shell");
    const isOpen = shell.dataset.mobileOpen === "true";
    shell.dataset.mobileOpen = isOpen ? "false" : "true";
  });

  /* Overlay click closes mobile sidebar */
  document.querySelector("#sidebarOverlay").addEventListener("click", () => {
    document.querySelector(".app-shell").removeAttribute("data-mobile-open");
  });
}

function renderPage() {
  const main = document.querySelector("#mainContent");
  if (!main) return;
  main.innerHTML = pageRenderers[store.route](store.data);
  afterRender();
}

function afterRender() {
  const canvas = document.querySelector("#productionChart");
  if (canvas) drawProductionChart(canvas, store.data.productionTrend);
  bindFleetInteractions(renderPage);
  bindSettingsForm();
}

function bindSettingsForm() {
  document.querySelector("#settingsForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const { showToast } = window._toastExport || {};
    if (typeof window._showToast === "function") window._showToast("Settings saved successfully", "success");
  });
}
