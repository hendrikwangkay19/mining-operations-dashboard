const statusVariants = {
  active: "success",
  good: "success",
  "on track": "success",
  standby: "neutral",
  warning: "warning",
  watch: "warning",
  high: "warning",
  medium: "warning",
  maintenance: "danger",
  delayed: "danger",
  action: "danger",
  urgent: "danger",
  low: "danger"
};

export function statusVariant(value) {
  return statusVariants[String(value).toLowerCase()] || "neutral";
}

export function badge(value) {
  return `<span class="status status-${statusVariant(value)}">${value}</span>`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function pageTitle(title, subtitle, action = "") {
  return `
    <div class="page-title">
      <div>
        <p class="eyebrow">Mining Operations</p>
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      ${action}
    </div>
  `;
}

export function metricCard(item) {
  return `
    <article class="card metric-card">
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${item.value}</div>
      <div class="delta ${item.tone}">${item.delta}</div>
    </article>
  `;
}

export function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

export function alertList(alerts) {
  if (!alerts.length) {
    return `<div class="empty-state">Tidak ada alert aktif untuk filter saat ini.</div>`;
  }

  return `
    <div class="alert-list">
      ${alerts.map((alert) => `
        <div class="alert-item">
          ${badge(alert.level)}
          <div class="alert-title">${alert.title}</div>
          <div class="alert-meta">${alert.area} - ${alert.time}</div>
        </div>
      `).join("")}
    </div>
  `;
}
