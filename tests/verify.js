const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    return require("C:/Users/DELL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
  }
}

const { chromium } = loadPlaywright();

const shouldStartServer = process.argv.includes("--server");
const baseUrl = process.env.APP_URL || (shouldStartServer ? "http://localhost:4174" : "http://localhost:4173");
const browserCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);

async function startServerIfNeeded() {
  if (!shouldStartServer) return null;

  const port = new URL(baseUrl).port || "4174";
  const child = spawn(process.execPath, ["server.js"], {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, PORT: port },
    stdio: "ignore"
  });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/mock-data`);
      if (response.ok) return child;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  child.kill();
  throw new Error(`Server did not start at ${baseUrl}`);
}

async function expectVisible(page, selector, label) {
  const element = page.locator(selector).first();
  await element.waitFor({ state: "visible", timeout: 8000 });
  return label;
}

async function verifyServerRoutes() {
  const missingAsset = await fetch(`${baseUrl}/missing-asset.png`);
  if (missingAsset.status !== 404) {
    throw new Error(`Missing asset returned ${missingAsset.status}, expected 404`);
  }

  const spaRoute = await fetch(`${baseUrl}/fleet`, {
    headers: { Accept: "text/html" }
  });
  const contentType = spaRoute.headers.get("content-type") || "";
  if (!spaRoute.ok || !contentType.includes("text/html")) {
    throw new Error(`SPA route fallback failed with ${spaRoute.status} ${contentType}`);
  }
}

(async () => {
  const server = await startServerIfNeeded();
  await verifyServerRoutes();
  const executablePath = browserCandidates.find((candidate) => fs.existsSync(candidate));
  const browser = await chromium.launch({
    headless: true,
    executablePath
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await expectVisible(page, ".login-form", "login form");
    await page.locator("button[type='submit']").click();
    await expectVisible(page, ".app-shell", "app shell");
    await expectVisible(page, "text=Dashboard", "dashboard nav");
    await page.locator("#notificationBtn").click();
    await expectVisible(page, ".notification-menu.open", "notification dropdown");
    await page.locator("#notificationBtn").click();
    await expectVisible(page, "text=Daily Production", "summary cards");
    await expectVisible(page, "#productionChart", "production chart");

    await page.locator("a[data-route='fleet']").click();
    await expectVisible(page, "text=Fleet Monitoring", "fleet page");
    await page.locator("[data-unit-id]").first().click();
    await expectVisible(page, ".modal-backdrop.open", "unit modal");
    await page.locator("#closeModal").click();

    await page.locator("a[data-route='production']").click();
    await expectVisible(page, "text=Production Monitoring", "production page");

    await page.locator("a[data-route='safety']").click();
    await expectVisible(page, "text=Safety Monitoring", "safety page");

    await page.locator("a[data-route='maintenance']").click();
    await expectVisible(page, "text=Maintenance Schedule", "maintenance page");

    await page.locator("a[data-route='dashboard']").click();
    await expectVisible(page, "text=Daily Production", "dashboard restored");
    const desktopShot = "artifacts/dashboard-desktop.png";
    await page.screenshot({ path: desktopShot, fullPage: true });

    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`${baseUrl}/#/dashboard`, { waitUntil: "networkidle" });
    await expectVisible(page, ".app-shell", "mobile app shell");
    const mobileShot = "artifacts/dashboard-mobile.png";
    await page.screenshot({ path: mobileShot, fullPage: true });

    await page.locator("#logoutBtn").click();
    await page.locator("select[name='role']").selectOption("Safety Officer");
    await page.locator("button[type='submit']").click();
    await expectVisible(page, "a[data-route='safety']", "safety route for safety role");
    const productionVisible = await page.locator("a[data-route='production']").count();
    if (productionVisible !== 0) {
      throw new Error("Production route should be hidden for Safety Officer");
    }

    console.log(`Verified app at ${baseUrl}`);
    console.log(`Screenshots: ${desktopShot}, ${mobileShot}`);
  } finally {
    await browser.close();
    if (server) server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
