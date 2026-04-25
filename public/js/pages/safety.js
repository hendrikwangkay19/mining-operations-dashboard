import { store } from "../store.js";
import { badge, metricCard, pageTitle, table, alertList, matchesQuery, resultCountLabel } from "../components.js";

export function renderSafety(data) {
  const safety = data.safety.filter((item) => matchesQuery(item, store.search));
  const alerts = data.alerts.filter((item) => matchesQuery(item, store.search));

  const rows = safety.map((item) => `
    <tr>
      <td><strong>${item.area}</strong></td>
      <td>${item.metric}</td>
      <td style="font-weight:700">${item.value}</td>
      <td>${badge(item.status)}</td>
    </tr>
  `);

  const kpiCards = safety.map((item) => metricCard({
    label: item.area,
    value: item.value,
    delta: item.metric,
    tone: item.status === "Good" ? "positive" : item.status === "Watch" ? "warning" : "danger",
  }));

  return `
    ${pageTitle("Safety Monitoring", "Leading indicators for safe production and field supervision.")}
    <section class="summary-grid" style="grid-template-columns:repeat(4,minmax(0,1fr))">
      ${kpiCards.join("")}
    </section>
    <section class="content-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Safety Indicators</h2>
          <span>${resultCountLabel(safety.length, data.safety.length, store.search)}</span>
        </div>
        ${table(["Area", "Metric", "Value", "Status"], rows)}
        ${safety.length === 0 ? `<div class="empty-state">No indicators match the current search.</div>` : ""}
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Active Alerts</h2>
          <span>${resultCountLabel(alerts.length, data.alerts.length, store.search)}</span>
        </div>
        ${alertList(alerts)}
      </article>
    </section>
  `;
}
