import type { IncomingMessage, ServerResponse } from "node:http";

const MAX_BODY_BYTES = 5 * 1024 * 1024;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown): void {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, "Requête trop volumineuse");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "JSON invalide");
  }
}

/**
 * Protège l'API locale : seul le panneau servi par ce proxy peut l'appeler.
 * - l'en-tête Host doit être le proxy (bloque le « DNS rebinding ») ;
 * - pour les écritures, l'origine doit être le proxy (bloque les autres sites ouverts).
 */
export function isTrustedRequest(req: IncomingMessage, port: number): boolean {
  const allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`];
  if (!allowedHosts.includes(req.headers.host ?? "")) return false;
  if (req.method === "GET" || req.method === "HEAD") {
    const site = req.headers["sec-fetch-site"];
    return site === undefined || site === "same-origin" || site === "none";
  }
  const origin = req.headers.origin;
  return origin !== undefined && allowedHosts.some((host) => origin === `http://${host}`);
}
