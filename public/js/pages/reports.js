import { store } from "../store.js";
import { badge, formatNumber, matchesQuery, pageTitle, resultCountLabel, table } from "../components.js";

export function renderReports(data) {
  const rows = data.production
    .map((item) => ({
      site: item.site,
      report: `${item.material} daily reconciliation`,
      actual: formatNumber(item.actual),
      status: item.recovery >= 100 ? "On Track" : item.recovery >= 96 ? "Watch" : "Delayed",
      owner: "Operations Control"
    }))
    .filter((item) => matchesQuery(item, store.search))
    .map((item) => `
      <tr>
        <td>${item.site}</td>
        <td>${item.report}</td>
        <td>${item.actual}</td>
        <td>${badge(item.status)}</td>
        <td>${item.owner}</td>
      </tr>
    `);

  return `
    ${pageTitle("Reports", "Concise operating reports for daily production, safety, and maintenance review.")}
    <section class="card panel">
      <div class="panel-header">
        <h2>Daily Reports</h2>
        <span>${resultCountLabel(rows.length, data.production.length, store.search)}</span>
      </div>
      ${table(["Site", "Report", "Actual", "Status", "Owner"], rows)}
    </section>
  `;
}
