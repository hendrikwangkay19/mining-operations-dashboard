import { routes, normalizeRoute } from "./routes.js";
import { store } from "./store.js";

export function renderNav(visibleRoutes) {
  return Object.entries(visibleRoutes).map(([key, route]) => `
    <a href="#/${key}" class="${store.route === key ? "active" : ""}" data-route="${key}" title="${route.label}">
      ${route.icon}
      <span class="nav-label">${route.label}</span>
    </a>
  `).join("");
}

export function bindNavEvents(visibleRoutes, onRouteChange) {
  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (!visibleRoutes[link.dataset.route]) return;
      store.route = link.dataset.route;
      store.notificationsOpen = false;
      history.pushState(null, "", `#/${store.route}`);
      // Close mobile sidebar
      const shell = document.querySelector(".app-shell");
      if (shell) shell.removeAttribute("data-mobile-open");
      onRouteChange();
    });
  });
}

export function bindRouteSync(onRouteChange) {
  window.addEventListener("hashchange", () => {
    if (!store.user) return;
    const route = location.hash.replace("#/", "");
    const next = normalizeRoute(route, store.user.role);
    if (routes[next] && store.route !== next) {
      store.route = next;
      store.notificationsOpen = false;
      onRouteChange();
    }
  });
}
