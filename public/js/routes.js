const icon = (path) =>
  `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;

export const ICONS = {
  dashboard:   icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>'),
  fleet:       icon('<rect x="1" y="4" width="14" height="11" rx="1"/><path d="M15 9h4l3 3v5h-7V9z"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/>'),
  production:  icon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>'),
  safety:      icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>'),
  maintenance: icon('<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>'),
  reports:     icon('<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'),
  settings:    icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>'),
};

export const routes = {
  dashboard:   { label: "Dashboard",        icon: ICONS.dashboard,   roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"] },
  fleet:       { label: "Fleet Monitor",    icon: ICONS.fleet,       roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"] },
  production:  { label: "Production",       icon: ICONS.production,  roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"] },
  safety:      { label: "Safety",           icon: ICONS.safety,      roles: ["Operations Lead", "Safety Officer"] },
  maintenance: { label: "Maintenance",      icon: ICONS.maintenance, roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"] },
  reports:     { label: "Reports",          icon: ICONS.reports,     roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"] },
  settings:    { label: "Settings",         icon: ICONS.settings,    roles: ["Operations Lead", "Safety Officer", "Maintenance Planner"] },
};

export function getVisibleRoutes(role) {
  return Object.fromEntries(
    Object.entries(routes).filter(([, r]) => r.roles.includes(role))
  );
}

export function normalizeRoute(route, role) {
  const visible = getVisibleRoutes(role);
  return visible[route] ? route : "dashboard";
}
