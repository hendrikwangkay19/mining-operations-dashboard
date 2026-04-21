import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const includeExtensions = new Set([".js", ".css", ".html", ".json", ".md", ".svg"]);
const ignoredDirs = new Set([".git", "artifacts", "node_modules"]);

function collectFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) return [];
      return collectFiles(path.join(dir, entry.name));
    }

    const fullPath = path.join(dir, entry.name);
    return includeExtensions.has(path.extname(fullPath)) ? [fullPath] : [];
  });
}

const failures = [];

for (const file of collectFiles(root)) {
  const text = fs.readFileSync(file, "utf8");
  const relativePath = path.relative(root, file);

  if (!text.endsWith("\n")) {
    failures.push(`${relativePath}: missing final newline`);
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (/[ \t]+$/.test(line)) {
      failures.push(`${relativePath}:${index + 1}: trailing whitespace`);
    }
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Format check passed");
