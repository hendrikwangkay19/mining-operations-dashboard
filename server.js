import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const PORT = process.env.PORT || 4173;
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_FILE = path.join(ROOT, "data", "mock-data.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

function sendJson(res, statusCode, payload) {
  send(res, statusCode, JSON.stringify(payload), mimeTypes[".json"]);
}

function shouldFallbackToSpa(req, extension) {
  if (req.method !== "GET") return false;
  if (extension) return false;
  const accepts = req.headers.accept || "";
  return accepts.includes("text/html") || accepts.includes("*/*");
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const decodedPath = decodeURIComponent(requestedPath);
  const filePath = path.normalize(path.join(PUBLIC_DIR, decodedPath));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      const extension = path.extname(filePath).toLowerCase();
      if (shouldFallbackToSpa(req, extension)) {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (indexError, indexContent) => {
          if (indexError) {
            send(res, 404, "Not found");
            return;
          }
          send(res, 200, indexContent, mimeTypes[".html"]);
        });
        return;
      }

      send(res, 404, "Asset not found");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    send(res, 200, content, mimeTypes[extension] || "application/octet-stream");
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/mock-data")) {
    fs.readFile(DATA_FILE, "utf8", (error, json) => {
      if (error) {
        sendJson(res, 500, { error: "Unable to read mock data" });
        return;
      }
      send(res, 200, json, mimeTypes[".json"]);
    });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Mining dashboard running at http://localhost:${PORT}`);
});
