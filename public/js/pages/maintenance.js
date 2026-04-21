import { badge, pageTitle, table } from "../components.js";

export function renderMaintenance(data) {
  const rows = data.maintenance.map((item) => `
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
          <span>${data.maintenance.length} planned jobs</span>
        </div>
        ${table(["Unit", "Work Type", "Due Date", "Priority", "Owner"], rows)}
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Urgency Queue</h2>
          <span>Sorted by due date</span>
        </div>
        <div class="stack">
          ${data.maintenance.map((item) => `
            <div class="alert-item">
              ${badge(item.priority)}
              <div class="alert-title">${item.unit} - ${item.type}</div>
              <div class="alert-meta">${item.owner} - due ${item.due}</div>
            </div>
          `).join("")}
        </div>
      </article>
    </section>
  `;
}
