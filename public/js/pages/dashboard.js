import { store } from "../store.js";
import { badge, pageTitle, metricCard, table, alertList, matchesQuery, resultCountLabel } from "../components.js";
import { renderUtilization, renderFleetDonut } from "../charts.js";

export function renderDashboard(data) {
  const ops    = data.operations.filter((item) => matchesQuery(item, store.search));
  const alerts = data.alerts.filter((item) => matchesQuery(item, store.search));

  const opRows = ops.map((item) => `
    <tr>
      <td><span class="status status-neutral" style="font-family:monospace">Shift ${item.shift}</span></td>
      <td><strong>${item.site}</strong></td>
      <td>${item.activity}</td>
      <td>${item.target}</td>
      <td>${item.actual}</td>
      <td>${badge(item.status)}</td>
    </tr>
  `);

  return `
    ${pageTitle("Operations Dashboard", "Real-time snapshot for production, fleet, safety, and maintenance.")}
    <section class="summary-grid">${data.summary.map(metricCard).join("")}</section>
    <section class="content-grid">
      <div>
        <article class="card panel">
          <div class="panel-header">
            <h2>Production Trend</h2>
            <span>Overburden &amp; Coal — last 7 days</span>
          </div>
          <canvas class="chart" id="productionChart"></canvas>
        </article>
        <article class="card panel">
          <div class="panel-header">
            <h2>Operations Log</h2>
            <span>${resultCountLabel(ops.length, data.operations.length, store.search)}</span>
          </div>
          ${table(["Shift", "Site", "Activity", "Target", "Actual", "Status"], opRows)}
        </article>
      </div>
      <div>
        <article class="card panel">
          <div class="panel-header">
            <h2>Fleet Status</h2>
            <span>${data.fleet.length} units total</span>
          </div>
          ${renderFleetDonut(data.fleet)}
        </article>
        <article class="card panel">
          <div class="panel-header">
            <h2>Equipment Utilization</h2>
            <span>By class</span>
          </div>
          ${renderUtilization(data.utilization)}
        </article>
        <article class="card panel">
          <div class="panel-header">
            <h2>Active Alerts</h2>
            <span>${resultCountLabel(alerts.length, data.alerts.length, store.search)}</span>
          </div>
          ${alertList(alerts)}
        </article>
      </div>
    </section>
  `;
}
