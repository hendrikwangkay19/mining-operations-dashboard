import { store, setFleetView } from "./store.js";
import { unitModal } from "./pages/fleet.js";

export function bindFleetInteractions(onUpdate) {
  /* Unit card modal */
  document.querySelectorAll("[data-unit-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.unitId;
      const unit = store.data.fleet.find((u) => u.id === id);
      if (!unit) return;
      const backdrop = document.querySelector("#unitModal");
      backdrop.innerHTML = unitModal(unit);
      backdrop.classList.add("open");
    });
  });

  /* Close modal */
  const backdrop = document.querySelector("#unitModal");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop || e.target.id === "closeModal") {
        backdrop.classList.remove("open");
      }
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") backdrop?.classList.remove("open");
  });

  /* Status filter */
  document.querySelector("#fleetStatus")?.addEventListener("change", (e) => {
    store.fleetStatus = e.target.value;
    onUpdate();
  });

  /* Site filter */
  document.querySelector("#fleetSite")?.addEventListener("change", (e) => {
    store.fleetSite = e.target.value;
    onUpdate();
  });

  /* View toggle */
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setFleetView(btn.dataset.view);
      onUpdate();
    });
  });
}
