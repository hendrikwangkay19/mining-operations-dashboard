import assert from "node:assert/strict";
import { getVisibleRoutes, normalizeRoute } from "../public/js/routes.js";
import { statusVariant, badge } from "../public/js/components.js";

export function runHelperTests() {
  assert.equal(normalizeRoute("production", "Operations Lead"), "production");
  assert.equal(normalizeRoute("production", "Safety Officer"), "dashboard");
  assert.equal(normalizeRoute("unknown", "Operations Lead"), "dashboard");

  const safetyRoutes = Object.keys(getVisibleRoutes("Safety Officer"));
  assert.deepEqual(safetyRoutes, ["dashboard", "fleet", "safety"]);

  assert.equal(statusVariant("On Track"), "success");
  assert.equal(statusVariant("Watch"), "warning");
  assert.equal(statusVariant("Urgent"), "danger");
  assert.equal(statusVariant("Standby"), "neutral");
  assert.match(badge("On Track"), /status-success/);
}
