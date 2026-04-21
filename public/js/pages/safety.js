import { store } from "../store.js";
import { metricCard, pageTitle, table, badge, alertList, matchesQuery, resultCountLabel } from "../components.js";

export function renderSafety(data) {
  const safety = data.safety.filter((item) => matchesQuery(item, store.search));
  const alerts = data.alerts.filter((item) => matchesQuery(item, store.search));
  const rows = safety.map((item) => `
    <tr>
      <td>${item.area}</td>
      <td>${item.metric}</td>
      <td>${item.value}</td>
      <td>${badge(item.status)}</td>
    </tr>
  `);

  return `
    ${pageTitle("Safety Monitoring", "Leading indicators for safe production and field supervision.")}
    <section class="summary-grid">
      ${safety.length ? safety.map((item) => metricCard({
        label: item.area,
        value: item.value,
        delta: item.metric,
        tone: item.status === "Good" ? "positive" : item.status === "Watch" ? "warning" : "danger"
      })).join("") : `<article class="card metric-card empty-state">No safety indicators match the current search.</article>`}
    </section>
    <section class="content-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Safety Indicators</h2>
          <span>${resultCountLabel(safety.length, data.safety.length, store.search)}</span>
        </div>
        ${table(["Area", "Metric", "Value", "Status"], rows)}
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Active Safety Alerts</h2>
          <span>${resultCountLabel(alerts.length, data.alerts.length, store.search)}</span>
        </div>
        ${alertList(alerts)}
      </article>
    </section>
  `;
}
