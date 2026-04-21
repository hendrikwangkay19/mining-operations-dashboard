import { store } from "../store.js";
import { badge, pageTitle, table, matchesQuery, resultCountLabel } from "../components.js";

export function renderMaintenance(data) {
  const maintenance = data.maintenance.filter((item) => matchesQuery(item, store.search));
  const rows = maintenance.map((item) => `
    <tr>
      <td>${item.unit}</td>
      <td>${item.type}</td>
      <td>${item.due}</td>
      <td>${badge(item.priority)}</td>
      <td>${item.owner}</td>
    </tr>
  `);

  return `
    ${pageTitle("Maintenance Schedule", "Upcoming service plan, urgent work orders, and accountable owner teams.")}
    <section class="content-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Maintenance Schedule</h2>
          <span>${resultCountLabel(maintenance.length, data.maintenance.length, store.search)}</span>
        </div>
        ${table(["Unit", "Work Type", "Due Date", "Priority", "Owner"], rows)}
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Urgency Queue</h2>
          <span>Sorted by due date</span>
        </div>
        <div class="stack">
          ${maintenance.length ? maintenance.map((item) => `
            <div class="alert-item">
              ${badge(item.priority)}
              <div class="alert-title">${item.unit} - ${item.type}</div>
              <div class="alert-meta">${item.owner} - due ${item.due}</div>
            </div>
          `).join("") : `<div class="empty-state">No maintenance jobs match the current search.</div>`}
        </div>
      </article>
    </section>
  `;
}
