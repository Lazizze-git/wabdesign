import { execFile } from "node:child_process";
import { sep } from "node:path";

function run(command: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve) => {
    execFile(command, args, { timeout: 5000 }, (error, stdout) => resolve(error && !stdout ? "" : stdout));
  });
}

/** Lit la sortie « lsof -F » : p<pid> puis n<adresse> pour chaque processus. */
export function parseListeningPorts(output: string): Map<number, number[]> {
  const ports = new Map<number, number[]>();
  let pid = 0;
  for (const line of output.split("\n")) {
    if (line.startsWith("p")) pid = Number(line.slice(1));
    const port = line.startsWith("n") ? Number(/:(\d+)$/.exec(line)?.[1]) : NaN;
    if (pid && Number.isInteger(port)) ports.set(pid, [...new Set([...(ports.get(pid) ?? []), port])]);
  }
  return ports;
}

export function parseWorkingDirs(output: string): Map<number, string> {
  const dirs = new Map<number, string>();
  let pid = 0;
  for (const line of output.split("\n")) {
    if (line.startsWith("p")) pid = Number(line.slice(1));
    else if (line.startsWith("n") && pid) dirs.set(pid, line.slice(1));
  }
  return dirs;
}

/** Vrai si ce port est déjà un panneau de design (on ne relaie pas un relais). */
async function isDesignProxy(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/__design/api/status`, { signal: AbortSignal.timeout(800) });
    return response.ok;
  } catch {
    return false;
  }
}

/** Le serveur tourne dans le projet ou dans un de ses sous-dossiers (jamais dans un dossier parent). */
function belongsTo(dir: string, projectDir: string): boolean {
  return dir === projectDir || dir.startsWith(projectDir + sep);
}

/**
 * Trouve le serveur de preview lancé depuis le dossier du projet (macOS / Linux, via lsof).
 * Évite de se brancher sur la preview d'un autre projet qui tournerait en parallèle.
 */
export async function findProjectDevPort(projectDir: string, exclude: number): Promise<number | null> {
  const listening = parseListeningPorts(await run("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN", "-Fpn"]));
  if (listening.size === 0) return null;
  const pids = [...listening.keys()].join(",");
  const dirs = parseWorkingDirs(await run("lsof", ["-a", "-d", "cwd", "-p", pids, "-Fpn"]));
  const candidates: number[] = [];
  for (const [pid, ports] of listening) {
    const dir = dirs.get(pid);
    if (dir && belongsTo(dir, projectDir)) candidates.push(...ports.filter((port) => port !== exclude));
  }
  // Un serveur de dev ouvre parfois un port interne en plus : on essaie du plus petit au plus grand.
  for (const port of [...new Set(candidates)].sort((a, b) => a - b)) {
    if (!(await isDesignProxy(port))) return port;
  }
  return null;
}

/** Adresse d'un panneau déjà lancé pour ce projet (ports 4000 à 4019), s'il y en a un. */
export async function findRunningPanel(projectDir: string, firstPort: number): Promise<string | null> {
  for (let port = firstPort; port < firstPort + 20; port += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/__design/api/status`, { signal: AbortSignal.timeout(500) });
      if (!response.ok) continue;
      const status: unknown = await response.json();
      const project = status && typeof status === "object" && "project" in status ? status.project : null;
      if (project === projectDir) return `http://localhost:${port}`;
    } catch {
      // Port libre ou autre service : on passe au suivant.
    }
  }
  return null;
}
