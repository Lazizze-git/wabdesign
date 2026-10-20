import { googleFamilyUrl, googlePreviewUrl } from "../../shared/google";
import type { FontFaceInfo, FontFamily } from "../../shared/types";
import { fontFileUrl } from "../api";
import { notify } from "../state/toasts";
import { OWN_NODE_PREFIX } from "./stylesheet-scan";

const loadedFaces = new Set<string>();
const loadedGoogle = new Set<string>();
const previewed = new Set<string>();

function addStylesheet(id: string, href: string): void {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  link.addEventListener("error", () => notify(`Police Google introuvable (${href})`, "error"));
  (document.head ?? document.documentElement).append(link);
}

function slug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function loadLocalFace(family: string, face: FontFaceInfo): void {
  if (loadedFaces.has(face.id)) return;
  loadedFaces.add(face.id);
  const weight = face.weightRange ? `${face.weightRange[0]} ${face.weightRange[1]}` : String(face.weight);
  const fontFace = new FontFace(family, `url(${fontFileUrl(face.id)})`, { weight, style: face.style, display: "swap" });
  document.fonts.add(fontFace);
  fontFace.load().catch(() => {
    loadedFaces.delete(face.id);
    notify(`Impossible de charger ${family} ${face.weight}`, "error");
  });
}

/** Charge toutes les graisses d'une famille, pour l'utiliser dans la page. */
export function loadFamily(family: FontFamily): void {
  if (family.source === "google") {
    if (loadedGoogle.has(family.family)) return;
    loadedGoogle.add(family.family);
    addStylesheet(`${OWN_NODE_PREFIX}-gf-${slug(family.family)}`, googleFamilyUrl(family));
    return;
  }
  for (const face of family.faces) loadLocalFace(family.family, face);
}

/** Charge juste de quoi afficher le nom de la famille dans la liste. */
export function loadPreview(family: FontFamily): void {
  if (previewed.has(family.key)) return;
  previewed.add(family.key);
  if (family.source === "google") {
    if (!loadedGoogle.has(family.family)) {
      addStylesheet(`${OWN_NODE_PREFIX}-gfp-${slug(family.family)}`, googlePreviewUrl(family.family));
    }
    return;
  }
  const regular =
    family.faces.find((face) => face.style === "normal" && (face.weightRange || face.weight === 400)) ??
    family.faces.find((face) => face.style === "normal") ??
    family.faces[0];
  if (regular) loadLocalFace(family.family, regular);
}
