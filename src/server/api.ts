import { createReadStream } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { z } from "zod";
import { configSchema, sessionSchema, validateSchema } from "../shared/schemas";
import type { StatusResponse, ValidateEvent } from "../shared/types";
import { validateChanges } from "./apply/validate";
import type { FontService } from "./fonts/font-service";
import { HttpError, readJsonBody, sendJson } from "./http-utils";
import { requestLanguage } from "./i18n";
import { findDriveRoot } from "./paths";
import { pickFolder } from "./pick-folder";
import { loadConfig, loadSession, saveConfig, saveSession } from "./stores";

export interface ApiContext {
  projectDir: string;
  target: string;
  fonts: FontService;
  claudeAvailable: boolean;
}

const FONT_MIME: Record<string, string> = {
  woff2: "font/woff2",
  woff: "font/woff",
  truetype: "font/ttf",
  opentype: "font/otf",
};

function parse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new HttpError(400, "errInvalidData");
  return result.data;
}

function serveFontFile(res: ServerResponse, ctx: ApiContext, id: string): void {
  const face = ctx.fonts.file(id);
  if (!face) throw new HttpError(404, "errFontNotFound");
  res.writeHead(200, {
    "content-type": FONT_MIME[face.format] ?? "application/octet-stream",
    "cache-control": "private, max-age=3600",
  });
  const stream = createReadStream(face.path);
  stream.on("error", () => res.destroy());
  stream.pipe(res);
}

async function streamValidation(req: IncomingMessage, res: ServerResponse, ctx: ApiContext): Promise<void> {
  const body = parse(validateSchema, await readJsonBody(req));
  if (body.mode === "claude" && !ctx.claudeAvailable) {
    throw new HttpError(400, "errClaudeMissing");
  }
  res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
  const emit = (event: ValidateEvent): void => {
    if (!res.writableEnded) res.write(`${JSON.stringify(event)}\n`);
  };
  await validateChanges(ctx.projectDir, body.changes, body.mode, ctx.fonts, emit, body.language);
  res.end();
}

/** Routes de /__design/api/… */
export async function handleApi(req: IncomingMessage, res: ServerResponse, path: string, ctx: ApiContext): Promise<void> {
  const route = `${req.method ?? "GET"} ${path}`;
  if (route === "GET /status") {
    const status: StatusResponse = {
      project: ctx.projectDir,
      target: ctx.target,
      claudeAvailable: ctx.claudeAvailable,
      driveRoot: findDriveRoot(),
    };
    return sendJson(res, 200, status);
  }
  if (route === "GET /config") return sendJson(res, 200, await loadConfig());
  if (route === "PUT /config") {
    const config = parse(configSchema, await readJsonBody(req));
    await saveConfig(config);
    return sendJson(res, 200, config);
  }
  if (route === "GET /fonts" || route === "GET /fonts?refresh=1") {
    const fonts = await ctx.fonts.list(await loadConfig(), requestLanguage(req), route.endsWith("refresh=1"));
    return sendJson(res, 200, fonts);
  }
  const fontFile = /^GET \/fonts\/file\/([a-f0-9]{16})$/.exec(route);
  if (fontFile?.[1]) return serveFontFile(res, ctx, fontFile[1]);
  if (route === "POST /pick-folder") return sendJson(res, 200, { path: await pickFolder() });
  if (route === "GET /session") return sendJson(res, 200, await loadSession(ctx.projectDir));
  if (route === "PUT /session") {
    await saveSession(ctx.projectDir, parse(sessionSchema, await readJsonBody(req)));
    return sendJson(res, 200, { ok: true });
  }
  if (route === "POST /validate") return streamValidation(req, res, ctx);
  throw new HttpError(404, "errUnknownRoute");
}
