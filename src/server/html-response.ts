import type { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from "node:http";
import { brotliDecompressSync, gunzipSync, inflateSync } from "node:zlib";
import { injectPanel } from "./inject";
import { tm } from "./i18n";
import { errorMessage, logger } from "./logger";

const HOP_BY_HOP = ["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-connection"];

/** Recopie les en-têtes de la preview en remplaçant son adresse par celle du proxy. */
export function forwardHeaders(source: IncomingMessage, targetOrigin: string, proxyOrigin: string): OutgoingHttpHeaders {
  const headers: OutgoingHttpHeaders = { ...source.headers };
  const location = headers["location"];
  if (typeof location === "string" && location.startsWith(targetOrigin)) {
    headers["location"] = proxyOrigin + location.slice(targetOrigin.length);
  }
  return headers;
}

function without(headers: OutgoingHttpHeaders, names: readonly string[]): OutgoingHttpHeaders {
  return Object.fromEntries(Object.entries(headers).filter(([name]) => !names.includes(name.toLowerCase())));
}

function decode(body: Buffer, encoding: string | undefined): Buffer {
  switch (encoding) {
    case "gzip":
      return gunzipSync(body);
    case "br":
      return brotliDecompressSync(body);
    case "deflate":
      return inflateSync(body);
    default:
      return body;
  }
}

/** Lit une page HTML de la preview, y ajoute le panneau et la renvoie au navigateur. */
export function sendInjectedHtml(proxyRes: IncomingMessage, res: ServerResponse, headers: OutgoingHttpHeaders): void {
  const chunks: Buffer[] = [];
  proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
  proxyRes.on("error", () => res.destroy());
  proxyRes.on("end", () => {
    let html: string;
    try {
      html = decode(Buffer.concat(chunks), proxyRes.headers["content-encoding"]).toString("utf8");
    } catch (error) {
      logger.warn(tm("pageUnreadableLog", { error: errorMessage(error) }));
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
      res.end(tm("pageUnreadable"));
      return;
    }
    const body = Buffer.from(injectPanel(html), "utf8");
    const cleaned = without(headers, [...HOP_BY_HOP, "content-length", "content-encoding", "etag", "content-security-policy"]);
    cleaned["content-length"] = body.length;
    cleaned["cache-control"] = "no-store";
    res.writeHead(proxyRes.statusCode ?? 200, cleaned);
    res.end(body);
  });
}

/** Les autres fichiers (JS, images, CSS…) passent tels quels. */
export function sendPassthrough(proxyRes: IncomingMessage, res: ServerResponse, headers: OutgoingHttpHeaders): void {
  const cleaned = without(headers, HOP_BY_HOP.filter((name) => name !== "transfer-encoding"));
  res.writeHead(proxyRes.statusCode ?? 200, cleaned);
  proxyRes.pipe(res);
}
