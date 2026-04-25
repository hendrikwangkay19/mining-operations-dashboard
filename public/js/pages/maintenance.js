import { store } from "../store.js";
import { badge, pageTitle, table, matchesQuery, resultCountLabel } from "../components.js";

function priorityClass(p) {
  const m = { "Urgent": "priority-urgent", "High": "priority-high", "Medium": "priority-medium", "Low": "priority-low" };
  return m[p] || "";
}

function daysUntil(due) {
  const now = new Date();
  const d   = new Date(due);
  const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diff < 0)  return `<span style="color:var(--red);font-weight:700">${Math.abs(diff)}d overdue</span>`;
  if (diff === 0) return `<span style="color:var(--amber);font-weight:700">Due today</span>`;
  if (diff <= 3)  return `<span style="color:var(--amber);font-weight:700">In ${diff}d</span>`;
  return `<span style="color:var(--muted)">In ${diff}d</span>`;
}

export function renderMaintenance(data) {
  const maintenance = data.maintenance.filter((item) => matchesQuery(item, store.search));
  const sorted = [...maintenance].sort((a, b) => new Date(a.due) - new Date(b.due));

  const rows = maintenance.map((item) => `
    <tr>
      <td><strong>${item.unit}</strong></td>
      <td>${item.type}</td>
      <td>${item.due}</td>
      <td>${daysUntil(item.due)}</td>
      <td>${badge(item.priority)}</td>
      <td>${item.owner}</td>
    </tr>
  `);

  return `
    ${pageTitle("Maintenance Schedule", "Upcoming service plan, work orders, and accountable owner teams.")}
    <section class="content-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Work Order Table</h2>
          <span>${resultCountLabel(maintenance.length, data.maintenance.length, store.search)}</span>
        </div>
        ${table(["Unit", "Work Type", "Due Date", "Timeline", "Priority", "Owner"], rows)}
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Urgency Queue</h2>
          <span>Sorted by due date</span>
        </div>
        <div class="stack">
          ${sorted.length ? sorted.map((item) => `
            <div class="alert-item ${priorityClass(item.priority)}">
              ${badge(item.priority)}
              <div>
                <div class="alert-title">${item.unit} &mdash; ${item.type}</div>
                <div class="alert-meta">${item.owner} &middot; ${item.due}</div>
              </div>
            </div>
          `).join("") : `<div class="empty-state">No work orders match current search.</div>`}
        </div>
      </article>
    </section>
  `;
}
