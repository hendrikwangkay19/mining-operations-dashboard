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
    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"]
  },
  safety: {
    label: "Safety",
    icon: "SF",
    roles: ["Operations Lead", "Safety Officer"]
  },
  maintenance: {
    label: "Maintenance",
    icon: "MT",
    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"]
  },
  reports: {
    label: "Reports",
    icon: "RP",
    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"]
  },
  settings: {
    label: "Settings",
    icon: "ST",
    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"]
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
