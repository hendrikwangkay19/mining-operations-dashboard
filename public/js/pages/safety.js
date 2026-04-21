import { metricCard, pageTitle, table, badge, alertList } from "../components.js";

export function renderSafety(data) {
  const rows = data.safety.map((item) => `
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
      ${data.safety.map((item) => metricCard({
        label: item.area,
        value: item.value,
        delta: item.metric,
        tone: item.status === "Good" ? "positive" : item.status === "Watch" ? "warning" : "danger"
      })).join("")}
    </section>
    <section class="content-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Safety Indicators</h2>
          <span>Area-level status</span>
        </div>
        ${table(["Area", "Metric", "Value", "Status"], rows)}
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Active Safety Alerts</h2>
          <span>Requires supervisor review</span>
        </div>
        ${alertList(data.alerts)}
      </article>
    </section>
  `;
}
