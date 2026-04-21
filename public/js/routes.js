export const routes = {
  dashboard: {
    label: "Dashboard",
    icon: "DB",
    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"]
  },
  fleet: {
    label: "Fleet Monitoring",
    icon: "FL",
    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"]
  },
  production: {
    label: "Production",
    icon: "PR",
    roles: ["Operations Lead"]
  },
  safety: {
    label: "Safety",
    icon: "SF",
    roles: ["Operations Lead", "Safety Officer"]
  },
  maintenance: {
    label: "Maintenance",
    icon: "MT",
    roles: ["Operations Lead", "Maintenance Planner"]
  }
};

export function getVisibleRoutes(role) {
  return Object.fromEntries(
    Object.entries(routes).filter(([, route]) => route.roles.includes(role))
  );
}

export function normalizeRoute(route, role) {
  const visibleRoutes = getVisibleRoutes(role);
  return visibleRoutes[route] ? route : "dashboard";
}
