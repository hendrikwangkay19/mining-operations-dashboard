import { store } from "./store.js";

export function renderNotifications() {
  const notifications = store.data?.notifications || [];
  return `
    <div class="notification-menu ${store.notificationsOpen ? "open" : ""}">
      <div class="notification-head">
        <strong>Notifications</strong>
        <span>${notifications.length} new</span>
      </div>
      ${notifications.length ? notifications.map((item) => `
        <button class="notification-item" type="button">${item}</button>
      `).join("") : `<div class="empty-state">Tidak ada notifikasi baru.</div>`}
    </div>
  `;
}

export function bindNotificationToggle(onToggle) {
  document.querySelector("#notificationBtn").addEventListener("click", () => {
    store.notificationsOpen = !store.notificationsOpen;
    onToggle();
  });
}
