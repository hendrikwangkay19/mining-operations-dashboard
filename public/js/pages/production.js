import { store } from "../store.js";
import { badge, formatNumber, pageTitle, table, matchesQuery, resultCountLabel } from "../components.js";

function recoveryClass(r) {
  if (r >= 100) return "fill-success";
  if (r >= 96)  return "fill-warning";
  return "fill-danger";
}

function recoveryStatus(r) {
  if (r >= 100) return "On Track";
  if (r >= 96)  return "Watch";
  return "Delayed";
}

export function renderProduction(data) {
  const production = data.production.filter((item) => matchesQuery(item, store.search));

  const rows = production.map((item) => `
    <tr>
      <td><strong>${item.site}</strong></td>
      <td>${item.material}</td>
      <td>${formatNumber(item.target)}</td>
      <td>${formatNumber(item.actual)}</td>
      <td>${item.quality !== "N/A" ? item.quality : "<span style='color:var(--muted)'>—</span>"}</td>
      <td><span style="font-weight:700;color:${item.recovery >= 100 ? "var(--brand)" : item.recovery >= 96 ? "var(--amber)" : "var(--red)"}">${item.recovery}%</span></td>
      <td>${badge(recoveryStatus(item.recovery))}</td>
    </tr>
  `);

  return `
    ${pageTitle("Production Monitoring", "Targets, actuals, and recovery rate for all active production areas.")}
    <section class="split-grid" style="margin-bottom:18px">
      <article class="card panel">
        <div class="panel-header">
          <h2>Achievement vs Target</h2>
          <span>${resultCountLabel(production.length, data.production.length, store.search)}</span>
        </div>
        <div class="stack">
          ${production.length ? production.map((item) => `
            <div class="card progress-card">
              <div class="progress-head">
                <span class="progress-label">${item.site}</span>
                <span class="progress-pct" style="color:${item.recovery >= 100 ? "var(--brand)" : item.recovery >= 96 ? "var(--amber)" : "var(--red)"}">${item.recovery}%</span>
              </div>
              <div class="progress-sub">${item.material} &mdash; ${formatNumber(item.actual)} of ${formatNumber(item.target)}</div>
              <div class="progress-track">
                <div class="progress-fill ${recoveryClass(item.recovery)}" style="width:${Math.min(item.recovery, 110)}%"></div>
              </div>
            </div>
          `).join("") : `<div class="empty-state">No records match current search.</div>`}
        </div>
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Weekly Trend</h2>
          <span>Overburden &amp; Coal (7 days)</span>
        </div>
        <canvas class="chart" id="productionChart"></canvas>
      </article>
    </section>
    <article class="card panel">
      <div class="panel-header">
        <h2>Production Table</h2>
        <span>${resultCountLabel(production.length, data.production.length, store.search)}</span>
      </div>
      ${table(["Site", "Material", "Target", "Actual", "Quality", "Recovery", "Status"], rows)}
    </article>
  `;
}
