/** Sortie terminal de l'outil (le seul endroit qui écrit dans la console). */

const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";

function write(stream: NodeJS.WriteStream, color: string, message: string): void {
  stream.write(`${color}◆${RESET} ${message}\n`);
}

export const logger = {
  info(message: string): void {
    write(process.stdout, CYAN, message);
  },
  detail(message: string): void {
    process.stdout.write(`${DIM}  ${message}${RESET}\n`);
  },
  warn(message: string): void {
    write(process.stderr, YELLOW, message);
  },
  error(message: string, cause?: unknown): void {
    const reason = cause instanceof Error ? ` (${cause.message})` : "";
    write(process.stderr, RED, `${message}${reason}`);
  },
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
