import { store } from "./store.js";
import { unitModal } from "./pages/fleet.js";

export function bindFleetInteractions(onPageChange) {
  bindFleetFilters(onPageChange);
  bindUnitCards();
}

function bindFleetFilters(onPageChange) {
  const statusFilter = document.querySelector("#fleetStatus");
  const siteFilter = document.querySelector("#fleetSite");

  if (statusFilter) {
    statusFilter.addEventListener("change", (event) => {
      store.fleetStatus = event.target.value;
      onPageChange();
    });
  }

  if (siteFilter) {
    siteFilter.addEventListener("change", (event) => {
      store.fleetSite = event.target.value;
      onPageChange();
    });
  }
}

function bindUnitCards() {
  document.querySelectorAll("[data-unit-id]").forEach((button) => {
    button.addEventListener("click", () => openUnitModal(button.dataset.unitId));
  });
}

function openUnitModal(unitId) {
  const unit = store.data.fleet.find((item) => item.id === unitId);
  const modal = document.querySelector("#unitModal");
  modal.innerHTML = unitModal(unit);
  modal.classList.add("open");
  document.querySelector("#closeModal").addEventListener("click", closeUnitModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeUnitModal();
  }, { once: true });
}

function closeUnitModal() {
  const modal = document.querySelector("#unitModal");
  modal.classList.remove("open");
  modal.innerHTML = "";
}
