import { spawn, spawnSync } from "node:child_process";
import { relative } from "node:path";
import { z } from "zod";
import type { Language } from "../../shared/types";
import { LocalizedError, msg } from "../i18n";

const TIMEOUT_MS = 10 * 60 * 1000;
const ALLOWED_TOOLS = "Read,Edit,Write,Glob,Grep,Bash(cp:*),Bash(mkdir:*),Bash(ls:*)";

export function isClaudeAvailable(): boolean {
  const result = spawnSync("claude", ["--version"], { stdio: "ignore", timeout: 10000 });
  return result.status === 0;
}

const toolUseSchema = z.object({
  type: z.literal("tool_use"),
  name: z.string(),
  input: z.record(z.string(), z.unknown()),
});

const streamLineSchema = z.union([
  z.object({
    type: z.literal("assistant"),
    message: z.object({ content: z.array(z.unknown()) }),
  }),
  z.object({ type: z.literal("result"), is_error: z.boolean().optional(), result: z.string().optional() }),
]);

function describeTool(name: string, input: Record<string, unknown>, cwd: string, language: Language): string | null {
  const file = typeof input["file_path"] === "string" ? relative(cwd, input["file_path"]) : null;
  switch (name) {
    case "Edit":
    case "Write":
      return file ? msg(language, "stepEdit", { file }) : msg(language, "stepEditAny");
    case "Read":
      return file ? msg(language, "stepRead", { file }) : null;
    case "Grep":
    case "Glob":
      return msg(language, "stepSearch");
    case "Bash":
      return msg(language, "stepCopyFonts");
    default:
      return null;
  }
}

export interface RunnerCallbacks {
  onStep(message: string): void;
}

/** Lance Claude Code en arrière-plan dans le projet, et raconte ce qu'il fait au fur et à mesure. */
export function runClaude(prompt: string, cwd: string, language: Language, callbacks: RunnerCallbacks): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["-p", prompt, "--output-format", "stream-json", "--verbose"];
    args.push("--permission-mode", "acceptEdits", "--allowedTools", ALLOWED_TOOLS);
    const child = spawn("claude", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    const timer = setTimeout(() => child.kill("SIGTERM"), TIMEOUT_MS);
    let buffer = "";
    let stderr = "";
    let summary: string | null = null;
    let failed = false;

    const handleLine = (line: string): void => {
      if (!line.trim()) return;
      let parsed: z.infer<typeof streamLineSchema>;
      try {
        const result = streamLineSchema.safeParse(JSON.parse(line));
        if (!result.success) return;
        parsed = result.data;
      } catch {
        return;
      }
      if (parsed.type === "result") {
        summary = parsed.result ?? "";
        failed = parsed.is_error === true;
        return;
      }
      for (const block of parsed.message.content) {
        const tool = toolUseSchema.safeParse(block);
        if (!tool.success) continue;
        const step = describeTool(tool.data.name, tool.data.input, cwd, language);
        if (step) callbacks.onStep(step);
      }
    };

    child.stdout.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(handleLine);
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = (stderr + chunk.toString("utf8")).slice(-4000);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(new LocalizedError("claudeLaunchFailed", { error: error.message }));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      handleLine(buffer);
      if (summary !== null && !failed) return resolve(summary);
      const reason = summary || stderr.trim() || msg(language, "claudeExitCode", { code: code ?? msg(language, "unknown") });
      reject(new LocalizedError("claudeFailed", { reason }));
    });
  });
}
