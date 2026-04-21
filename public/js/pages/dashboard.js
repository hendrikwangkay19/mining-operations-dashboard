import { store } from "../store.js";
import { badge, pageTitle, metricCard, table, alertList, matchesQuery, resultCountLabel } from "../components.js";
import { renderUtilization } from "../charts.js";

export function renderDashboard(data) {
  const operations = data.operations.filter((item) => matchesQuery(item, store.search));
  const alerts = data.alerts.filter((item) => matchesQuery(item, store.search));
  const operationRows = operations.map((item) => `
    <tr>
      <td>${item.shift}</td>
      <td>${item.site}</td>
      <td>${item.activity}</td>
      <td>${item.target}</td>
      <td>${item.actual}</td>
      <td>${badge(item.status)}</td>
    </tr>
  `);

  return `
    ${pageTitle("Dashboard", "Real-time operating snapshot for production, utilization, hauling, safety, and maintenance.")}
    <section class="summary-grid">${data.summary.map(metricCard).join("")}</section>
    <section class="content-grid">
      <div>
        <article class="card panel">
          <div class="panel-header">
            <h2>Production Trend</h2>
            <span>Overburden and coal, last 7 days</span>
          </div>
          <canvas class="chart" id="productionChart" width="900" height="280"></canvas>
        </article>
        <article class="card panel">
          <div class="panel-header">
            <h2>Table Operations</h2>
            <span>${resultCountLabel(operations.length, data.operations.length, store.search)}</span>
          </div>
          ${table(["Shift", "Site", "Activity", "Target", "Actual", "Status"], operationRows)}
        </article>
      </div>
      <div>
        <article class="card panel">
          <div class="panel-header">
            <h2>Fleet Utilization</h2>
            <span>Equipment class</span>
          </div>
          ${renderUtilization(data.utilization)}
        </article>
        <article class="card panel">
          <div class="panel-header">
            <h2>Alert Panel</h2>
            <span>${resultCountLabel(alerts.length, data.alerts.length, store.search)}</span>
          </div>
          ${alertList(alerts)}
        </article>
      </div>
    </section>
  `;
}
