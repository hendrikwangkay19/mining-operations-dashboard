const statusVariants = {
  active: "success", good: "success", "on track": "success",
  standby: "neutral", watch: "warning", high: "warning", medium: "warning",
  warning: "warning", maintenance: "danger", delayed: "danger",
  action: "danger", urgent: "danger", low: "danger",
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

export function matchesQuery(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return Object.values(item).some((v) => String(v).toLowerCase().includes(q));
}

export function resultCountLabel(count, total, query) {
  if (!query.trim()) return `${total} records`;
  return `${count} of ${total} results`;
}

export function deltaArrow(delta) {
  if (String(delta).startsWith("+")) return "&#8593;";
  if (String(delta).startsWith("-")) return "&#8595;";
  return "";
}

export function pageTitle(title, subtitle, action = "") {
  return `
    <div class="page-title">
      <div>
        <span class="eyebrow">Mining Operations</span>
        <h1>${title}</h1>
        <p class="page-subtitle">${subtitle}</p>
      </div>
      ${action ? `<div class="page-title-actions">${action}</div>` : ""}
    </div>
  `;
}

export function metricCard(item) {
  const tone = item.tone || "neutral";
  const stripeClass = tone === "positive" ? "stripe-success" : tone === "warning" ? "stripe-warning" : tone === "danger" ? "stripe-danger" : "";
  const deltaClass  = tone === "positive" ? "delta-positive" : tone === "warning" ? "delta-warning" : tone === "danger" ? "delta-danger" : "delta-neutral";
  const arrow = deltaArrow(item.delta);
  return `
    <article class="card metric-card ${stripeClass}">
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${item.value}</div>
      <div class="metric-delta ${deltaClass}">${arrow ? `<span>${arrow}</span>` : ""}${item.delta}</div>
    </article>
  `;
}

export function table(headers, rows) {
  if (!rows.length) {
    return `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      No records match the current search.
    </div>`;
  }
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

export function alertList(alerts) {
  if (!alerts.length) {
    return `<div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      Tidak ada alert aktif.
    </div>`;
  }
  return `<div class="alert-list">
    ${alerts.map((alert) => `
      <div class="alert-item">
        ${badge(alert.level)}
        <div>
          <div class="alert-title">${alert.title}</div>
          <div class="alert-meta">${alert.area} &middot; ${alert.time}</div>
        </div>
      </div>
    `).join("")}
  </div>`;
}

/* Toast notification */
export function showToast(message, type = "info", duration = 3800) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    error:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${icons[type] || icons.info}${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
