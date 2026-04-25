import { store } from "../store.js";
import { badge, formatNumber, matchesQuery, pageTitle, resultCountLabel, table } from "../components.js";

const downloadIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" style="width:14px;height:14px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;

export function renderReports(data) {
  const reportItems = data.production.map((item) => ({
    site:   item.site,
    report: `${item.material} daily reconciliation`,
    actual: formatNumber(item.actual),
    status: item.recovery >= 100 ? "On Track" : item.recovery >= 96 ? "Watch" : "Delayed",
    owner:  "Operations Control",
    date:   new Date().toISOString().split("T")[0],
  })).filter((item) => matchesQuery(item, store.search));

  const rows = reportItems.map((item) => `
    <tr>
      <td><strong>${item.site}</strong></td>
      <td>${item.report}</td>
      <td>${item.date}</td>
      <td style="font-weight:700">${item.actual}</td>
      <td>${badge(item.status)}</td>
      <td>${item.owner}</td>
    </tr>
  `);

  return `
    ${pageTitle(
      "Reports",
      "Daily production, safety, and maintenance reconciliation reports.",
      `<button class="secondary-btn" id="exportBtn">${downloadIcon} Export CSV</button>`
    )}
    <article class="card panel">
      <div class="report-export-bar">
        <div class="report-meta">
          Report date: <strong>${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>
          &nbsp;&middot;&nbsp; ${resultCountLabel(reportItems.length, data.production.length, store.search)}
        </div>
      </div>
      ${table(["Site", "Report", "Date", "Actual Output", "Status", "Owner"], rows)}
    </article>
  `;
}
