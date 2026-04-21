import { pageTitle } from "../components.js";

export function renderSettings() {
  return `
    ${pageTitle("Settings", "Basic workspace preferences for the operations dashboard.")}
    <section class="split-grid">
      <article class="card panel">
        <div class="panel-header">
          <h2>Workspace</h2>
          <span>Active</span>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><small>Timezone</small>Asia/Shanghai</div>
          <div class="detail-item"><small>Refresh Mode</small>Mock API</div>
          <div class="detail-item"><small>Navigation</small>Core pages only</div>
          <div class="detail-item"><small>Search</small>Basic data filtering</div>
        </div>
      </article>
      <article class="card panel">
        <div class="panel-header">
          <h2>Display</h2>
          <span>Default</span>
        </div>
        <div class="stack">
          <div class="alert-item">
            <div class="alert-title">Compact operational layout</div>
            <div class="alert-meta">Optimized for clear navigation and stable dashboard views.</div>
          </div>
          <div class="alert-item">
            <div class="alert-title">Search recommendations disabled</div>
            <div class="alert-meta">Search remains focused on simple, predictable data filtering.</div>
          </div>
        </div>
      </article>
    </section>
  `;
}
