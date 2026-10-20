import { computed, signal } from "@preact/signals";
import type { Config, FontFamily, FontRef, FontsResponse, StatusResponse } from "../../shared/types";
import { api } from "../api";
import { notify } from "./toasts";

/** Réglages personnels (dossiers, palettes, favoris…) et catalogue de polices. */
export const config = signal<Config | null>(null);
export const status = signal<StatusResponse | null>(null);
export const fonts = signal<FontsResponse>({ local: [], google: [], errors: [] });
export const fontsLoading = signal(false);

export const allFamilies = computed<FontFamily[]>(() => [...fonts.value.local, ...fonts.value.google]);

export function findFamily(ref: FontRef): FontFamily | undefined {
  const list = ref.source === "local" ? fonts.value.local : fonts.value.google;
  return list.find((family) => family.family === ref.family);
}

export async function loadFonts(refresh = false): Promise<void> {
  fontsLoading.value = true;
  try {
    fonts.value = await api.fonts(refresh);
    for (const error of fonts.value.errors.slice(0, 3)) notify(error, "error");
  } catch (error) {
    notify(`Polices indisponibles : ${error instanceof Error ? error.message : "erreur inconnue"}`, "error");
  } finally {
    fontsLoading.value = false;
  }
}

/** Modifie les réglages, les enregistre, et recharge les polices si les dossiers ont changé. */
export async function updateConfig(update: (current: Config) => Config): Promise<void> {
  const current = config.value;
  if (!current) return;
  const next = update(current);
  config.value = next;
  try {
    config.value = await api.saveConfig(next);
    const foldersChanged = next.fontFolders.join("\n") !== current.fontFolders.join("\n");
    if (foldersChanged || next.googleFonts !== current.googleFonts) await loadFonts(true);
  } catch (error) {
    config.value = current;
    notify(`Réglage non enregistré : ${error instanceof Error ? error.message : "erreur inconnue"}`, "error");
  }
}

export async function loadLibrary(): Promise<void> {
  try {
    const [loadedConfig, loadedStatus] = await Promise.all([api.config(), api.status()]);
    config.value = loadedConfig;
    status.value = loadedStatus;
  } catch (error) {
    notify(`Serveur de l’outil injoignable : ${error instanceof Error ? error.message : ""}`, "error");
    return;
  }
  await loadFonts();
}

export function isFavorite(family: FontFamily): boolean {
  return config.value?.favorites.includes(family.key) ?? false;
}

export function toggleFavorite(family: FontFamily): void {
  void updateConfig((current) => ({
    ...current,
    favorites: current.favorites.includes(family.key)
      ? current.favorites.filter((key) => key !== family.key)
      : [...current.favorites, family.key],
  }));
}
