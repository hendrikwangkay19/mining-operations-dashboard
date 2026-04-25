import { store } from "./store.js";

export function renderNotifications() {
  const items = store.data ? store.data.notifications : [];
  const unread = items.length;
  const bellIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`;

  return `
    <button class="icon-btn" id="notificationBtn" title="Notifications" aria-expanded="${store.notificationsOpen}">
      ${bellIcon}
      ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ""}
    </button>
    <div class="notification-menu ${store.notificationsOpen ? "open" : ""}" id="notificationMenu">
      <div class="notification-head">
        <strong>Notifications</strong>
        <span>${unread} new</span>
      </div>
      ${items.map((item) => `
        <button class="notification-item">
          <span class="notification-dot"></span>
          <span>${item}</span>
        </button>
      `).join("")}
      ${!items.length ? `<div class="empty-state" style="padding:16px">No notifications</div>` : ""}
    </div>
  `;
}

export function bindNotificationToggle(onUpdate) {
  const btn = document.querySelector("#notificationBtn");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    store.notificationsOpen = !store.notificationsOpen;
    onUpdate();
  });
  document.addEventListener("click", (e) => {
    const menu = document.querySelector("#notificationMenu");
    if (menu && store.notificationsOpen && !menu.contains(e.target) && e.target !== btn) {
      store.notificationsOpen = false;
      onUpdate();
    }
  }, { once: false });
}
