/**
 * HTTPS reverse proxy for LAN voice channel testing.
 *
 * Run alongside `pnpm dev`:
 *   node scripts/https-proxy.mjs
 *
 * - Host machine:  http://localhost:3000  (unchanged)
 * - Other devices: https://192.168.x.x:3001  (accept cert warning once)
 *
 * Generates a self-signed certificate via openssl.
 * Proxies both HTTP requests and WebSocket upgrades.
 */

import { createServer as createHttpsServer } from "node:https";
import { request as httpRequest } from "node:http";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { networkInterfaces } from "node:os";

const TARGET_HOST = "127.0.0.1";
const TARGET_PORT = 3000;
const PROXY_PORT = 3001;

// ── Generate self-signed cert via openssl ──

function generateCert() {
  const keyPath = join(tmpdir(), "piscord-dev-key.pem");
  const certPath = join(tmpdir(), "piscord-dev-cert.pem");

  execSync(
    `openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 ` +
      `-keyout "${keyPath}" -out "${certPath}" -days 365 -nodes ` +
      `-subj "/CN=piscord-dev" 2>/dev/null`,
    { stdio: "pipe" }
  );

  return {
    key: readFileSync(keyPath, "utf-8"),
    cert: readFileSync(certPath, "utf-8")
  };
}

// ── Proxy logic ──

function proxyRequest(clientReq, clientRes, ssl) {
  const proxyReq = httpRequest(
    {
      hostname: TARGET_HOST,
      port: TARGET_PORT,
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: `${TARGET_HOST}:${TARGET_PORT}`
      }
    },
    (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[proxy]", err.message);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502);
      clientRes.end("Bad Gateway - is pnpm dev running?");
    }
  });

  clientReq.pipe(proxyReq);
}

function proxyWebSocket(clientReq, clientSocket, head) {
  const proxyReq = httpRequest({
    hostname: TARGET_HOST,
    port: TARGET_PORT,
    path: clientReq.url,
    method: "GET",
    headers: {
      ...clientReq.headers,
      host: `${TARGET_HOST}:${TARGET_PORT}`
    }
  });

  proxyReq.on("upgrade", (proxyRes, proxySocket, proxyHead) => {
    // Build raw HTTP response
    let responseHeader = `HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`;
    for (let i = 0; i < proxyRes.rawHeaders.length; i += 2) {
      responseHeader += `${proxyRes.rawHeaders[i]}: ${proxyRes.rawHeaders[i + 1]}\r\n`;
    }
    responseHeader += "\r\n";

    clientSocket.write(responseHeader);
    if (proxyHead.length) clientSocket.write(proxyHead);

    proxySocket.pipe(clientSocket);
    clientSocket.pipe(proxySocket);

    proxySocket.on("error", () => clientSocket.destroy());
    clientSocket.on("error", () => proxySocket.destroy());
  });

  proxyReq.on("error", (err) => {
    console.error("[ws proxy]", err.message);
    clientSocket.destroy();
  });

  proxyReq.end();
}

// ── Start ──

async function main() {
  let ssl;
  try {
    ssl = generateCert();
  } catch (e) {
    console.error("Failed to generate SSL certificate:", e.message);
    console.error("Make sure openssl is installed.");
    process.exit(1);
  }

  const server = createHttpsServer(ssl, proxyRequest);
  server.on("upgrade", proxyWebSocket);

  server.listen(PROXY_PORT, "0.0.0.0", () => {
    const nets = networkInterfaces();
    console.log("\n🔒 HTTPS proxy running for LAN voice testing\n");
    console.log(`   Proxying https://0.0.0.0:${PROXY_PORT} → http://localhost:${TARGET_PORT}\n`);

    for (const [name, addrs] of Object.entries(nets)) {
      for (const addr of addrs) {
        if (addr.family === "IPv4" && !addr.internal) {
          console.log(`   ➜ https://${addr.address}:${PROXY_PORT}/`);
        }
      }
    }

    console.log("\n   On other devices: open the URL above and accept the certificate warning.\n");
  });
}

main();
