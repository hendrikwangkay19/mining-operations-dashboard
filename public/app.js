import { routes, normalizeRoute } from "./js/routes.js";
import { store, setUser, clearUser, setToken, clearToken, getToken, loadDashboardData } from "./js/store.js";
import { bindRouteSync } from "./js/nav.js";
import { mountShell } from "./js/shell.js";
import { showToast } from "./js/components.js";

/* Expose showToast globally for shell.js settings save handler */
window._showToast = showToast;

const app = document.querySelector("#app");

function renderLogin(errorMsg = "") {
  const hexagonIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 22 8 22 16 12 22 2 16 2 8"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8" x2="22" y2="8"/><line x1="2" y1="16" x2="22" y2="16"/></svg>`;
  const arrowIcon   = `<svg viewBox="0 0 20 20" fill="currentColor" class="btn-icon"><path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd"/></svg>`;

  app.innerHTML = `
    <main class="login-screen">
      <section class="login-hero">
        <div class="login-hero-content">
          <div class="login-brand">
            <div class="login-brand-mark">${hexagonIcon}</div>
            <span class="login-brand-name">MineDesk</span>
          </div>
          <span class="login-eyebrow">Internal Operations Platform</span>
          <h1 class="login-headline">Mining Operations<br>Command Center</h1>
          <p class="login-desc">One unified view for production targets, fleet health, hauling cycles, safety indicators, and maintenance scheduling across all active mining sites.</p>
          <div class="login-stats">
            <div class="login-stat"><strong>6</strong><span>Active Units</span></div>
            <div class="login-stat"><strong>4</strong><span>Production Sites</span></div>
            <div class="login-stat"><strong>3</strong><span>Shift Roles</span></div>
          </div>
        </div>
      </section>
      <section class="login-panel">
        <form class="login-form" id="loginForm" novalidate>
          <div class="login-form-header">
            <span class="eyebrow">Secure Access</span>
            <h2>Sign in</h2>
            <p class="login-form-desc">Enter your credentials to access the operations dashboard.</p>
          </div>
          ${errorMsg ? `<div class="login-error" role="alert">${errorMsg}</div>` : ""}
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input class="input" id="username" name="username" autocomplete="username" placeholder="e.g. ops.supervisor" required>
          </div>
          <div class="form-group">
            <label class="form-label" for="password">
              Password
              <a class="form-label-link" href="#" tabindex="-1">Forgot password?</a>
            </label>
            <input class="input" id="password" name="password" type="password" autocomplete="current-password" placeholder="Enter password" required>
          </div>
          <button class="primary-btn" type="submit" id="loginBtn">
            <span>Sign in to Dashboard</span>
            ${arrowIcon}
          </button>
          <p class="login-disclaimer">This system is for authorized personnel only. All activity is monitored and logged.</p>
        </form>
      </section>
    </main>
  `;

  document.querySelector("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn  = document.querySelector("#loginBtn");
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Authenticating…`;

    const form = new FormData(e.currentTarget);
    const username = form.get("username")?.trim();
    const password = form.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await res.json();

      if (!res.ok) {
        renderLogin(body.error || "Invalid username or password.");
        return;
      }

      setToken(body.token);
      setUser(body.user);
      await fetchData();
    } catch {
      renderLogin("Connection error. Please try again.");
    }
  });
}

function renderSkeleton() {
  const rows6 = Array.from({ length: 6 }, () => `<div class="skeleton-line" style="height:100px;border-radius:12px"></div>`).join("");
  app.innerHTML = `
    <div class="skeleton-shell">
      <div class="skeleton-sidebar">
        <div class="skeleton-line" style="width:80%;height:28px;margin-bottom:24px;border-radius:8px"></div>
        ${Array.from({ length: 7 }, () => `<div class="skeleton-line" style="width:90%;height:34px;margin-bottom:8px;border-radius:8px"></div>`).join("")}
      </div>
      <div class="skeleton-body">
        <div class="skeleton-topbar">
          <div class="skeleton-line" style="width:300px;height:34px;border-radius:8px"></div>
          <div style="margin-left:auto;display:flex;gap:10px">
            <div class="skeleton-line" style="width:34px;height:34px;border-radius:50%"></div>
            <div class="skeleton-line" style="width:90px;height:34px;border-radius:8px"></div>
          </div>
        </div>
        <div class="skeleton-content">
          <div class="skeleton-line" style="width:280px;height:32px;margin-bottom:8px;border-radius:8px"></div>
          <div class="skeleton-line" style="width:420px;height:18px;margin-bottom:24px;border-radius:6px"></div>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:18px">${rows6}</div>
          <div style="display:grid;grid-template-columns:1.6fr 0.8fr;gap:18px">
            <div>
              <div class="skeleton-line" style="height:280px;margin-bottom:18px;border-radius:12px"></div>
              <div class="skeleton-line" style="height:220px;border-radius:12px"></div>
            </div>
            <div>
              <div class="skeleton-line" style="height:180px;margin-bottom:18px;border-radius:12px"></div>
              <div class="skeleton-line" style="height:160px;border-radius:12px"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function fetchData() {
  renderSkeleton();
  try {
    await loadDashboardData();
    const hashRoute = location.hash.replace("#/", "");
    store.route = normalizeRoute(routes[hashRoute] ? hashRoute : "dashboard", store.user.role);
    mountShell(app, renderLogin);
    showToast(`Welcome back, ${store.user.name || store.user.username}`, "success");
  } catch {
    renderError();
  }
}

function renderError() {
  const warnIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  app.innerHTML = `
    <main class="error-screen">
      <section class="card panel error-panel">
        <div class="error-icon">${warnIcon}</div>
        <span class="eyebrow">Connection Error</span>
        <h2>Dashboard failed to load</h2>
        <p class="error-desc">${store.error}</p>
        <button class="primary-btn" id="retryBtn" style="margin-top:20px;width:100%">Retry connection</button>
      </section>
    </main>
  `;
  document.querySelector("#retryBtn").addEventListener("click", fetchData);
}

/* Handle logout from shell */
window._logout = function () {
  clearUser();
  clearToken();
  renderLogin();
};

bindRouteSync(() => mountShell(app, renderLogin));

if (store.user && getToken()) {
  fetchData();
} else {
  clearUser();
  clearToken();
  renderLogin();
}
