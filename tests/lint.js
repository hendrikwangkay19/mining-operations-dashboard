import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["server.js", "public", "tests"];

function collectJsFiles(entry) {
  const fullPath = path.join(root, entry);
  const stat = fs.statSync(fullPath);
  if (stat.isFile()) return fullPath.endsWith(".js") ? [fullPath] : [];

  return fs.readdirSync(fullPath).flatMap((child) => collectJsFiles(path.join(entry, child)));
}

const jsFiles = targets.flatMap(collectJsFiles);
const failures = [];

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8"
  });

  if (result.error || result.status !== 0) {
    failures.push(`${path.relative(root, file)}\n${result.error?.message || result.stderr || result.stdout || "Unknown lint failure"}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Lint passed for ${jsFiles.length} JavaScript files`);
