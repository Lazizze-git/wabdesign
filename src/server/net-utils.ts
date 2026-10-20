import { connect, createServer } from "node:net";

const COMMON_DEV_PORTS = [3000, 5173, 3001, 5174, 4321, 8080, 8000, 4200, 5000, 3002];

function canConnect(host: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = connect({ host, port });
    const done = (result: boolean): void => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(400, () => done(false));
    socket.once("connect", () => done(true));
    socket.once("error", () => done(false));
  });
}

/** Trouve sur quelle adresse (IPv4 ou IPv6) le serveur de preview écoute. URL-ready. */
export async function resolveTargetHost(port: number): Promise<string | null> {
  if (await canConnect("127.0.0.1", port)) return "127.0.0.1";
  if (await canConnect("::1", port)) return "[::1]";
  return null;
}

/** Cherche une preview déjà lancée sur les ports habituels (Next, Vite, Astro…). */
export async function detectDevPort(exclude: number): Promise<number | null> {
  for (const port of COMMON_DEV_PORTS) {
    if (port === exclude) continue;
    if (await resolveTargetHost(port)) return port;
  }
  return null;
}

function isFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => server.close(() => resolve(true)));
  });
}

export async function findFreePort(start: number, avoid: number): Promise<number> {
  for (let port = start; port < start + 50; port += 1) {
    if (port !== avoid && (await isFree(port))) return port;
  }
  throw new Error(`Aucun port libre entre ${start} et ${start + 49}`);
}
