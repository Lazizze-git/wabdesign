/** Types partagés entre le serveur local et le panneau injecté dans la page. */

export type FontSource = "local" | "google";

export interface FontAxis {
  tag: string;
  min: number;
  max: number;
  default: number;
}

export type FontStyle = "normal" | "italic";

/** Une graisse/un style d'une famille. Pour une police variable, `weightRange` couvre toute la plage. */
export interface FontFaceInfo {
  id: string;
  weight: number;
  weightRange: [number, number] | null;
  style: FontStyle;
  axes: FontAxis[];
}

export interface FontFamily {
  key: string;
  family: string;
  source: FontSource;
  category: string | null;
  /** Dossier d'origine (polices locales) ou « Google Fonts ». */
  origin: string;
  faces: FontFaceInfo[];
}

export interface FontRef {
  source: FontSource;
  family: string;
}

export interface FontsResponse {
  local: FontFamily[];
  google: FontFamily[];
  errors: string[];
}

export type FontRole = "headings" | "body" | "buttons";

/** « text » : contenu d'un élément réécrit (pas du CSS, appliqué directement dans la page). */
export type ChangeGroup = "inspect" | "system" | "fonts" | "vars" | "swap" | "text";

export type TargetScope = "element" | "similar" | "tag" | "role" | "global";

export interface ElementContext {
  tag: string;
  classes: string[];
  text: string;
  count: number;
}

export interface Target {
  selector: string;
  label: string;
  scope: TargetScope;
  context: ElementContext | null;
}

export interface Change {
  id: string;
  group: ChangeGroup;
  target: Target;
  property: string;
  value: string;
  /** Valeur d'origine, quand on la connaît (utile pour expliquer la modification). */
  previous: string | null;
  font: FontRef | null;
}

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

export interface RoleFont {
  font: FontRef;
  weight: number;
  style: FontStyle;
}

export interface Pairing {
  id: string;
  name: string;
  roles: Partial<Record<FontRole, RoleFont>>;
}

export interface Config {
  fontFolders: string[];
  googleFonts: boolean;
  palettes: Palette[];
  favorites: string[];
  pairings: Pairing[];
}

export interface Session {
  changes: Change[];
}

export interface StatusResponse {
  project: string;
  target: string;
  claudeAvailable: boolean;
  driveRoot: string | null;
}

export type ValidateMode = "claude" | "export";

export type ValidateEvent =
  | { type: "step"; message: string }
  | { type: "done"; message: string; file: string }
  | { type: "error"; message: string };
