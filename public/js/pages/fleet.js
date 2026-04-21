import { store } from "../store.js";
import { badge, formatNumber, pageTitle } from "../components.js";

export function renderFleet(data) {
  const sites = ["All", ...new Set(data.fleet.map((unit) => unit.site))];
  const statuses = ["All", ...new Set(data.fleet.map((unit) => unit.status))];
  const query = store.search.trim().toLowerCase();
  const units = data.fleet.filter((unit) => {
    const statusMatch = store.fleetStatus === "All" || unit.status === store.fleetStatus;
    const siteMatch = store.fleetSite === "All" || unit.site === store.fleetSite;
    const queryMatch = !query || Object.values(unit).some((value) => String(value).toLowerCase().includes(query));
    return statusMatch && siteMatch && queryMatch;
  });

  return `
    ${pageTitle("Fleet Monitoring", "Filter by unit status or site, then open unit detail for operational context.")}
    <section class="card panel">
      <div class="toolbar">
        <select class="select" id="fleetStatus" aria-label="Filter fleet status">
          ${statuses.map((status) => `<option ${status === store.fleetStatus ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        <select class="select" id="fleetSite" aria-label="Filter fleet site">
          ${sites.map((site) => `<option ${site === store.fleetSite ? "selected" : ""}>${site}</option>`).join("")}
        </select>
      </div>
      <div class="fleet-grid">
        ${units.length ? units.map(unitCard).join("") : `<div class="empty-state">No units match current filters.</div>`}
      </div>
    </section>
  `;
}

function unitCard(unit) {
  return `
    <article class="card unit-card">
      <button data-unit-id="${unit.id}">
        <div class="unit-head">
          <span class="unit-id">${unit.id}</span>
          ${badge(unit.status)}
        </div>
        <div class="unit-meta">${unit.type} - ${unit.site}</div>
        <div class="detail-grid">
          <div><small>Operator</small><strong>${unit.operator}</strong></div>
          <div><small>Hours</small><strong>${formatNumber(unit.hours)}</strong></div>
        </div>
        <p class="unit-meta">Fuel ${unit.fuel}%</p>
        <div class="fuel-line"><span style="width:${unit.fuel}%"></span></div>
      </button>
    </article>
  `;
}

export function unitModal(unit) {
  return `
    <div class="modal">
      <div class="modal-title">
        <div>
          <p class="eyebrow">Unit Detail</p>
          <h2>${unit.id} ${badge(unit.status)}</h2>
        </div>
        <button class="icon-btn" id="closeModal" title="Close">X</button>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><small>Type</small>${unit.type}</div>
        <div class="detail-item"><small>Site</small>${unit.site}</div>
        <div class="detail-item"><small>Operator</small>${unit.operator}</div>
        <div class="detail-item"><small>Fuel</small>${unit.fuel}%</div>
        <div class="detail-item"><small>Engine Hours</small>${formatNumber(unit.hours)}</div>
        <div class="detail-item"><small>Assignment</small>${unit.load}</div>
        <div class="detail-item"><small>Last Service</small>${unit.lastService}</div>
        <div class="detail-item"><small>GPS</small>${unit.gps}</div>
      </div>
    </div>
  `;
}
