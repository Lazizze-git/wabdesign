import { LANGUAGE_HEADER } from "../shared/types";
import { language, t } from "./i18n";
import type { Change, Config, FontsResponse, Session, StatusResponse, ValidateEvent, ValidateMode } from "../shared/types";

const BASE = "/__design/api";

/** Chaque appel dit au serveur dans quelle langue répondre (messages d’erreur, étapes). */
function headers(): Record<string, string> {
  return { "content-type": "application/json", [LANGUAGE_HEADER]: language.value };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...init?.headers },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : t("common.unknownError");
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export const api = {
  status: (): Promise<StatusResponse> => request("/status"),
  config: (): Promise<Config> => request("/config"),
  saveConfig: (config: Config): Promise<Config> => request("/config", { method: "PUT", body: JSON.stringify(config) }),
  fonts: (refresh = false): Promise<FontsResponse> => request(refresh ? "/fonts?refresh=1" : "/fonts"),
  pickFolder: (): Promise<{ path: string | null }> => request("/pick-folder", { method: "POST", body: "{}" }),
  session: (): Promise<Session> => request("/session"),
  saveSession: (session: Session): Promise<{ ok: true }> =>
    request("/session", { method: "PUT", body: JSON.stringify(session) }),
};

export function fontFileUrl(id: string): string {
  return `${BASE}/fonts/file/${id}`;
}

/** Envoie les modifications et lit, ligne par ligne, l'avancement de la validation. */
export async function validate(
  changes: readonly Change[],
  mode: ValidateMode,
  onEvent: (event: ValidateEvent) => void,
): Promise<void> {
  const response = await fetch(`${BASE}/validate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ changes, mode, language: language.value }),
  });
  if (!response.ok || !response.body) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "error" in body ? String(body.error) : t("validate.failed");
    throw new Error(message);
  }
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) onEvent(JSON.parse(line) as ValidateEvent);
    }
  }
}
