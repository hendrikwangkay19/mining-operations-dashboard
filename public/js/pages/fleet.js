import { store } from "../store.js";
import { badge, formatNumber, pageTitle, matchesQuery, resultCountLabel } from "../components.js";

const gridIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`;
const listIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`;

function fuelClass(fuel) {
  if (fuel >= 50) return "fuel-ok";
  if (fuel >= 25) return "fuel-warning";
  return "fuel-danger";
}

export function renderFleet(data) {
  const sites    = ["All", ...new Set(data.fleet.map((u) => u.site))];
  const statuses = ["All", ...new Set(data.fleet.map((u) => u.status))];
  const units = data.fleet.filter((u) => {
    const sm = store.fleetStatus === "All" || u.status === store.fleetStatus;
    const dm = store.fleetSite   === "All" || u.site   === store.fleetSite;
    return sm && dm && matchesQuery(u, store.search);
  });

  const isGrid = store.fleetView !== "list";

  return `
    ${pageTitle("Fleet Monitor",
      "Live equipment status across all active sites.",
      `<div class="view-toggle">
        <button class="view-toggle-btn ${isGrid ? "active" : ""}" data-view="grid" title="Grid view">${gridIcon}</button>
        <button class="view-toggle-btn ${!isGrid ? "active" : ""}" data-view="list" title="List view">${listIcon}</button>
      </div>`
    )}
    <article class="card panel">
      <div class="toolbar">
        <span class="toolbar-meta">${resultCountLabel(units.length, data.fleet.length, store.search)}</span>
        <select class="select" id="fleetStatus" aria-label="Filter by status">
          ${statuses.map((s) => `<option ${s === store.fleetStatus ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <select class="select" id="fleetSite" aria-label="Filter by site">
          ${sites.map((s) => `<option ${s === store.fleetSite ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="${isGrid ? "fleet-grid" : "fleet-list"}">
        ${units.length ? units.map((u) => unitCard(u, isGrid)).join("") : `<div class="empty-state">No units match the current filters.</div>`}
      </div>
    </article>
  `;
}

function unitCard(unit, isGrid) {
  const fc = fuelClass(unit.fuel);
  if (isGrid) {
    return `
      <article class="card unit-card">
        <button class="unit-card-btn" data-unit-id="${unit.id}">
          <div class="unit-head">
            <span class="unit-id">${unit.id}</span>
            ${badge(unit.status)}
          </div>
          <div class="unit-meta">${unit.type} &middot; ${unit.site}</div>
          <div class="unit-stats">
            <div class="unit-stat"><small>Operator</small><strong>${unit.operator}</strong></div>
            <div class="unit-stat"><small>Eng. Hours</small><strong>${formatNumber(unit.hours)}</strong></div>
          </div>
          <div class="fuel-bar-wrap">
            <div class="fuel-label"><span>Fuel</span><span>${unit.fuel}%</span></div>
            <div class="fuel-line"><span class="fuel-fill ${fc}" style="width:${unit.fuel}%"></span></div>
          </div>
        </button>
      </article>`;
  }
  return `
    <article class="card unit-card">
      <div class="unit-card-btn" style="display:grid;grid-template-columns:90px auto 1fr 1fr 1fr;align-items:center;gap:16px;padding:12px 16px">
        <span class="unit-id">${unit.id}</span>
        ${badge(unit.status)}
        <span style="color:var(--muted);font-size:13px">${unit.type} &middot; ${unit.site}</span>
        <span style="font-size:13px">${unit.operator}</span>
        <div>
          <div class="fuel-label"><span>Fuel ${unit.fuel}%</span></div>
          <div class="fuel-line" style="max-width:120px"><span class="fuel-fill ${fc}" style="width:${unit.fuel}%"></span></div>
        </div>
        <button class="secondary-btn" data-unit-id="${unit.id}" style="justify-self:end">Detail</button>
      </div>
    </article>`;
}

export function unitModal(unit) {
  const closeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  return `
    <div class="modal">
      <div class="modal-title">
        <div>
          <span class="eyebrow">Unit Detail</span>
          <h2>${unit.id} ${badge(unit.status)}</h2>
        </div>
        <button class="icon-btn" id="closeModal" title="Close">${closeIcon}</button>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><small>Type</small>${unit.type}</div>
        <div class="detail-item"><small>Site</small>${unit.site}</div>
        <div class="detail-item"><small>Operator</small>${unit.operator}</div>
        <div class="detail-item"><small>Fuel Level</small>${unit.fuel}%</div>
        <div class="detail-item"><small>Engine Hours</small>${formatNumber(unit.hours)}</div>
        <div class="detail-item"><small>Assignment</small>${unit.load}</div>
        <div class="detail-item"><small>Last Service</small>${unit.lastService}</div>
        <div class="detail-item"><small>GPS</small>${unit.gps}</div>
      </div>
      <div class="fuel-bar-wrap" style="margin-top:16px">
        <div class="fuel-label"><span>Fuel level</span><span>${unit.fuel}%</span></div>
        <div class="fuel-line" style="height:10px">
          <span class="fuel-fill ${fuelClass(unit.fuel)}" style="width:${unit.fuel}%"></span>
        </div>
      </div>
    </div>
  `;
}
