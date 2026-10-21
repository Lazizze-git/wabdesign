import { t } from "../i18n";
import { fontFamilyValue } from "../../shared/css";
import type { Change, FontFamily, FontRole, Pairing, RoleFont } from "../../shared/types";
import { loadFamily } from "../engine/font-loader";
import { nearestWeight } from "../engine/font-sync";
import { ROLE_ORDER, roleTarget } from "../engine/roles";
import { changes, findChange, upsertMany } from "./changes";
import { config, findFamily, fonts, updateConfig } from "./library";
import { notify, uid } from "./toasts";

function roleChanges(role: FontRole, family: FontFamily, weight: number, style: RoleFont["style"]): Change[] {
  const target = roleTarget(role);
  const make = (property: string, value: string, withFont: boolean): Change => ({
    id: uid("chg"),
    group: "fonts",
    target,
    property,
    value,
    previous: findChange("fonts", target.selector, property)?.previous ?? null,
    font: withFont ? { source: family.source, family: family.family } : null,
  });
  return [
    make("font-family", fontFamilyValue(family.family, family.category), true),
    make("font-weight", String(nearestWeight(family, weight, style === "italic")), false),
    make("font-style", style, false),
  ];
}

/** Applique une combinaison enregistrée (une seule étape d'annulation). */
export function applyPairing(pairing: Pairing): void {
  const batch: Change[] = [];
  for (const role of ROLE_ORDER) {
    const setting = pairing.roles[role];
    if (!setting) continue;
    const family = findFamily(setting.font);
    if (!family) {
      notify(t("fonts.pairingMissing", { family: setting.font.family }), "error");
      continue;
    }
    loadFamily(family);
    batch.push(...roleChanges(role, family, setting.weight, setting.style));
  }
  if (batch.length > 0) upsertMany(batch);
}

/** Enregistre les polices actuellement choisies pour chaque rôle. */
export function saveCurrentPairing(): void {
  const roles: Pairing["roles"] = {};
  for (const role of ROLE_ORDER) {
    const selector = roleTarget(role).selector;
    const familyChange = changes.value.find((c) => c.group === "fonts" && c.target.selector === selector && c.property === "font-family");
    if (!familyChange?.font) continue;
    const weight = Number(findChange("fonts", selector, "font-weight")?.value ?? 400);
    const style = findChange("fonts", selector, "font-style")?.value === "italic" ? "italic" : "normal";
    roles[role] = { font: familyChange.font, weight, style };
  }
  const names = Object.values(roles).map((setting) => setting.font.family);
  if (names.length === 0) {
    notify(t("fonts.pairingNeedsFont"), "error");
    return;
  }
  const pairing: Pairing = { id: uid("pair"), name: [...new Set(names)].join(" + "), roles };
  void updateConfig((current) => ({ ...current, pairings: [pairing, ...current.pairings] }));
  notify(t("fonts.pairingSaved"));
}

export function deletePairing(id: string): void {
  void updateConfig((current) => ({ ...current, pairings: current.pairings.filter((p) => p.id !== id) }));
}

function randomItem<T>(items: readonly T[]): T | undefined {
  return items[Math.floor(Math.random() * items.length)];
}

/** Tire au sort une police de titre et une de texte, parmi les favoris (sinon mes polices, sinon Google). */
export function shufflePairing(): void {
  const favorites = config.value?.favorites ?? [];
  const everything = [...fonts.value.local, ...fonts.value.google];
  const favoritePool = everything.filter((family) => favorites.includes(family.key));
  const pool =
    favoritePool.length >= 2 ? favoritePool : fonts.value.local.length >= 2 ? fonts.value.local : fonts.value.google.slice(0, 150);
  const headings = randomItem(pool);
  const body = randomItem(pool.filter((family) => family !== headings)) ?? headings;
  if (!headings || !body) {
    notify(t("fonts.shuffleNotEnough"), "error");
    return;
  }
  loadFamily(headings);
  loadFamily(body);
  upsertMany([...roleChanges("headings", headings, 700, "normal"), ...roleChanges("body", body, 400, "normal")]);
}
