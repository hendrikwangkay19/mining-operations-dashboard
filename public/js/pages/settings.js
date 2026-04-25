import { store } from "../store.js";
import { pageTitle } from "../components.js";

export function renderSettings() {
  return `
    ${pageTitle("Settings", "Workspace preferences and display configuration for your dashboard.")}
    <form id="settingsForm">
      <section class="split-grid">
        <div>
          <article class="card panel">
            <div class="settings-section">
              <h3>Account</h3>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Username</strong>
                  <span>Your login identifier</span>
                </div>
                <div class="settings-row-control">
                  <input class="input" value="${store.user ? store.user.name : ""}" readonly style="max-width:200px;background:var(--panel-strong);cursor:not-allowed">
                </div>
              </div>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Role</strong>
                  <span>Your access level and permissions</span>
                </div>
                <div class="settings-row-control">
                  <input class="input" value="${store.user ? store.user.role : ""}" readonly style="max-width:200px;background:var(--panel-strong);cursor:not-allowed">
                </div>
              </div>
            </div>

            <div class="settings-section">
              <h3>System</h3>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Timezone</strong>
                  <span>All times displayed in this zone</span>
                </div>
                <div class="settings-row-control">
                  <select class="select" name="timezone" style="max-width:200px">
                    <option selected>Asia/Makassar (WITA)</option>
                    <option>Asia/Jakarta (WIB)</option>
                    <option>Asia/Jayapura (WIT)</option>
                  </select>
                </div>
              </div>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Data Source</strong>
                  <span>Active data connection mode</span>
                </div>
                <div class="settings-row-control">
                  <select class="select" name="datasource" style="max-width:200px">
                    <option selected>Mock API (development)</option>
                    <option>Live API (production)</option>
                  </select>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div>
          <article class="card panel">
            <div class="settings-section">
              <h3>Display</h3>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Compact sidebar</strong>
                  <span>Collapse sidebar to icon-only mode</span>
                </div>
                <div class="settings-row-control">
                  <label class="toggle">
                    <input type="checkbox" name="compactSidebar" ${store.sidebarCollapsed ? "checked" : ""} id="sidebarCheckbox">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Fleet default view</strong>
                  <span>Grid or list layout for equipment</span>
                </div>
                <div class="settings-row-control">
                  <select class="select" name="fleetView" style="max-width:160px">
                    <option value="grid" ${store.fleetView === "grid" ? "selected" : ""}>Grid</option>
                    <option value="list" ${store.fleetView === "list" ? "selected" : ""}>List</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <h3>Notifications</h3>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Alert sound</strong>
                  <span>Play audio for high-priority alerts</span>
                </div>
                <div class="settings-row-control">
                  <label class="toggle">
                    <input type="checkbox" name="alertSound">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div class="settings-row">
                <div class="settings-row-label">
                  <strong>Desktop notifications</strong>
                  <span>Browser push notifications for alerts</span>
                </div>
                <div class="settings-row-control">
                  <label class="toggle">
                    <input type="checkbox" name="desktopNotif">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div class="settings-footer">
        <button type="button" class="secondary-btn">Reset to defaults</button>
        <button type="submit" class="primary-btn" style="min-width:140px">Save changes</button>
      </div>
    </form>
  `;
}
