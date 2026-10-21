import { readFileSync } from "node:fs";
import { isClaudeAvailable } from "./apply/claude-runner";
import { FontService } from "./fonts/font-service";
import { errorMessage, logger } from "./logger";
import { detectDevPort, findFreePort, resolveTargetHost } from "./net-utils";
import { findProjectDevPort, findRunningPanel } from "./project-server";
import { startProxy } from "./proxy-server";
import { installSkill, openInBrowser } from "./setup";
import { resolveTerminalLanguage, setTerminalLanguage, tm } from "./i18n";
import { loadConfig } from "./stores";

const DEFAULT_PROXY_PORT = 4000;

function version(): string {
  try {
    const pkg: unknown = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    return pkg && typeof pkg === "object" && "version" in pkg ? String(pkg.version) : tm("versionUnknown");
  } catch {
    return tm("versionUnknown");
  }
}

interface CliOptions {
  targetPort: number | null;
  proxyPort: number;
  open: boolean;
}

function parsePort(value: string | undefined): number | null {
  const port = Number(value?.replace(/^.*:/, ""));
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : null;
}

function parseArgs(argv: readonly string[]): CliOptions | null {
  if (argv.includes("--help") || argv.includes("-h")) return null;
  const portFlag = argv.indexOf("--port");
  const positional = argv.find((arg, index) => !arg.startsWith("--") && argv[index - 1] !== "--port");
  return {
    targetPort: positional ? parsePort(positional) : null,
    proxyPort: portFlag >= 0 ? (parsePort(argv[portFlag + 1]) ?? DEFAULT_PROXY_PORT) : DEFAULT_PROXY_PORT,
    open: !argv.includes("--no-open"),
  };
}

/** Préfère la preview lancée depuis ce dossier ; sinon un port habituel, avec un avertissement. */
async function findTargetPort(proxyPort: number): Promise<number | null> {
  const own = await findProjectDevPort(process.cwd(), proxyPort);
  if (own) return own;
  const fallback = await detectDevPort(proxyPort);
  if (fallback) {
    logger.warn(tm("fallbackPort", { port: fallback }));
  }
  return fallback;
}

async function main(): Promise<void> {
  setTerminalLanguage(resolveTerminalLanguage((await loadConfig()).language));
  const argv = process.argv.slice(2);
  if (argv[0] === "setup") return installSkill();
  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`wabdesign ${version()}\n`);
    return;
  }
  const options = parseArgs(argv);
  if (!options) {
    process.stdout.write(`${tm("cliHelp")}
`);
    return;
  }
  const running = options.targetPort ? null : await findRunningPanel(process.cwd(), options.proxyPort);
  if (running) {
    logger.info(tm("alreadyRunning", { url: running }));
    if (options.open) openInBrowser(running);
    return;
  }
  const targetPort = options.targetPort ?? (await findTargetPort(options.proxyPort));
  if (!targetPort) {
    logger.error(tm("noPreview"));
    process.exitCode = 1;
    return;
  }
  const targetHost = (await resolveTargetHost(targetPort)) ?? "127.0.0.1";
  const port = await findFreePort(options.proxyPort, targetPort);
  const claudeAvailable = isClaudeAvailable();
  await startProxy({
    targetPort,
    targetHost,
    port,
    api: { projectDir: process.cwd(), fonts: new FontService(), claudeAvailable },
  });
  const url = `http://localhost:${port}`;
  logger.info(tm("ready", { url }));
  logger.detail(tm("relay", { port: targetPort, dir: process.cwd() }));
  logger.detail(tm("shortcutHint"));
  if (!claudeAvailable) logger.warn(tm("claudeMissing"));
  if (options.open) openInBrowser(url);
}

main().catch((error: unknown) => {
  logger.error(tm("startFailed", { error: errorMessage(error) }));
  process.exitCode = 1;
});
