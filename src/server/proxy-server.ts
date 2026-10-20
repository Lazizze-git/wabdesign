import { readFile } from "node:fs/promises";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { Socket } from "node:net";
import httpProxy from "http-proxy";
import { handleApi, type ApiContext } from "./api";
import { forwardHeaders, sendInjectedHtml, sendPassthrough } from "./html-response";
import { HttpError, isTrustedRequest, sendJson } from "./http-utils";
import { PANEL_PATH } from "./inject";
import { errorMessage, logger } from "./logger";

export interface ProxyOptions {
  targetPort: number;
  targetHost: string;
  port: number;
  api: Omit<ApiContext, "target">;
}

const API_PREFIX = "/__design/api";
const PANEL_FILE = new URL("./panel.js", import.meta.url);

function unreachablePage(targetOrigin: string): string {
  return `<!doctype html><meta charset="utf-8"><title>Preview introuvable</title>
<body style="font:16px/1.5 -apple-system, BlinkMacSystemFont, sans-serif;padding:48px;max-width:560px">
<h1 style="font-size:20px">La preview ne répond pas</h1>
<p>Aucun serveur ne répond sur <b>${targetOrigin}</b>. Relance ton serveur de développement, puis recharge cette page.</p>`;
}

async function servePanel(res: ServerResponse): Promise<void> {
  const script = await readFile(PANEL_FILE);
  res.writeHead(200, { "content-type": "text/javascript; charset=utf-8", "cache-control": "no-store" });
  res.end(script);
}

/** Proxy local : relaie la preview, y injecte le panneau, et sert l'API du panneau. */
export function startProxy(options: ProxyOptions): Promise<Server> {
  const targetOrigin = `http://localhost:${options.targetPort}`;
  const proxyOrigin = `http://localhost:${options.port}`;
  const ctx: ApiContext = { ...options.api, target: targetOrigin };
  const proxy = httpProxy.createProxyServer({
    target: `http://${options.targetHost}:${options.targetPort}`,
    selfHandleResponse: true,
    ws: true,
  });

  const rewriteRequest = (proxyReq: { setHeader(name: string, value: string): void }, req: IncomingMessage): void => {
    proxyReq.setHeader("host", `localhost:${options.targetPort}`);
    if (req.headers.origin?.startsWith("http://localhost:")) proxyReq.setHeader("origin", targetOrigin);
    const referer = req.headers.referer;
    if (referer?.startsWith(proxyOrigin)) proxyReq.setHeader("referer", targetOrigin + referer.slice(proxyOrigin.length));
  };
  proxy.on("proxyReq", (proxyReq, req) => {
    proxyReq.setHeader("accept-encoding", "identity");
    rewriteRequest(proxyReq, req);
  });
  proxy.on("proxyReqWs", (proxyReq, req) => rewriteRequest(proxyReq, req));
  proxy.on("proxyRes", (proxyRes, req, res) => {
    const headers = forwardHeaders(proxyRes, targetOrigin, proxyOrigin);
    const isHtml = (proxyRes.headers["content-type"] ?? "").includes("text/html") && req.method !== "HEAD";
    if (isHtml) sendInjectedHtml(proxyRes, res, headers);
    else sendPassthrough(proxyRes, res, headers);
  });
  proxy.on("error", (_error, _req, res) => {
    if ("writeHead" in res && !res.headersSent) {
      res.writeHead(502, { "content-type": "text/html; charset=utf-8" });
      res.end(unreachablePage(targetOrigin));
    } else {
      res.destroy();
    }
  });

  const server = createServer((req, res) => {
    const url = req.url ?? "/";
    if (!url.startsWith("/__design/")) return proxy.web(req, res);
    if (!isTrustedRequest(req, options.port)) return sendJson(res, 403, { error: "Accès refusé" });
    const task = url === PANEL_PATH ? servePanel(res) : url.startsWith(API_PREFIX) ? handleApi(req, res, url.slice(API_PREFIX.length), ctx) : Promise.reject(new HttpError(404, "Introuvable"));
    task.catch((error: unknown) => {
      const status = error instanceof HttpError ? error.status : 500;
      if (status === 500) logger.error("Erreur du serveur local", error);
      if (!res.headersSent) sendJson(res, status, { error: errorMessage(error) });
      else res.end();
    });
  });
  server.on("upgrade", (req: IncomingMessage, socket: Socket, head: Buffer) => {
    if ((req.url ?? "").startsWith("/__design/")) return socket.destroy();
    proxy.ws(req, socket, head);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, "127.0.0.1", () => resolve(server));
  });
}
