import { store } from "../store.js";
import { badge, formatNumber, pageTitle, table, matchesQuery, resultCountLabel } from "../components.js";

export function renderProduction(data) {
  const production = data.production.filter((item) => matchesQuery(item, store.search));
  const rows = production.map((item) => `
    <tr>
      <td>${item.site}</td>
      <td>${item.material}</td>
      <td>${formatNumber(item.target)}</td>
      <td>${formatNumber(item.actual)}</td>
      <td>${item.quality}</td>
      <td>${badge(item.recovery >= 100 ? "On Track" : item.recovery >= 96 ? "Watch" : "Delayed")}</td>
    </tr>
  `);

  return `
    ${pageTitle("Production Monitoring", "Targets, actuals, and recovery rate for active production areas.")}
    <section class="split-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Production Achievement</h2>
          <span>Actual vs target</span>
        </div>
        <div class="stack">
          ${production.length ? production.map((item) => `
            <div class="progress-card card">
              <div class="progress-head">
                <span>${item.site}</span>
                <span>${item.recovery}%</span>
              </div>
              <div class="progress-track"><span style="width:${Math.min(item.recovery, 110)}%"></span></div>
            </div>
          `).join("") : `<div class="empty-state">No production records match the current search.</div>`}
        </div>
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Weekly Trend</h2>
          <span>Coal and overburden</span>
        </div>
        <canvas class="chart" id="productionChart" width="900" height="280"></canvas>
      </article>
    </section>
    <article class="card panel">
      <div class="panel-header">
        <h2>Production Table</h2>
          <span>${resultCountLabel(production.length, data.production.length, store.search)}</span>
      </div>
      ${table(["Site", "Material", "Target", "Actual", "Quality", "Status"], rows)}
    </article>
  `;
}
