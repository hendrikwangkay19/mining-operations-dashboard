import { routes, normalizeRoute } from "./routes.js";
import { store } from "./store.js";

export function renderNav(visibleRoutes) {
  return Object.entries(visibleRoutes)
    .map(([key, route]) => `
      <a href="#/${key}" class="${store.route === key ? "active" : ""}" data-route="${key}">
        <span>${route.icon}</span>
        <span>${route.label}</span>
      </a>
    `)
    .join("");
}

export function bindNavEvents(visibleRoutes, onRouteChange) {
  document.querySelectorAll(".nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      if (!visibleRoutes[link.dataset.route]) return;

      store.route = link.dataset.route;
      store.notificationsOpen = false;
      history.pushState(null, "", `#/${store.route}`);
      onRouteChange();
    });
  });
}

export function bindRouteSync(onRouteChange) {
  window.addEventListener("hashchange", () => {
    if (!store.user) return;
    const route = location.hash.replace("#/", "");
    const nextRoute = normalizeRoute(route, store.user.role);

    if (routes[nextRoute] && store.route !== nextRoute) {
      store.route = nextRoute;
      store.notificationsOpen = false;
      onRouteChange();
    }
  });
}
