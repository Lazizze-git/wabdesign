import type { Change, Config, FontsResponse, Session, StatusResponse, ValidateEvent, ValidateMode } from "../shared/types";

const BASE = "/__design/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `Erreur ${response.status}`;
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
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ changes, mode }),
  });
  if (!response.ok || !response.body) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "error" in body ? String(body.error) : "Validation impossible";
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
