/** Réglages globaux du « design system » : une valeur appliquée à toute une famille d'éléments. */
export interface SystemSetting {
  id: string;
  label: string;
  selector: string;
  sample: string;
  property: string;
  /** Propriété lue pour pré-remplir (quand on écrit un raccourci comme padding-block). */
  readProperty?: string;
  units: readonly string[];
  step?: number;
  min?: number;
}

export interface SystemGroup {
  title: string;
  settings: readonly SystemSetting[];
}

const BUTTONS = 'button, [role="button"], input[type="submit"], input[type="button"]';
const BUTTON_SAMPLE = 'button, [role="button"]';
const FIELDS = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), select, textarea';
const HEADINGS = "h1, h2, h3, h4, h5, h6";

export const SYSTEM_GROUPS: readonly SystemGroup[] = [
  {
    title: "Texte",
    settings: [
      { id: "body-size", label: "Taille du texte", selector: "body, p, li", sample: "p, li, body", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "body-leading", label: "Interligne", selector: "p, li", sample: "p, li", property: "line-height", units: ["", "px"], step: 0.05, min: 0 },
      { id: "paragraph-gap", label: "Espace entre paragraphes", selector: "p:not(:last-child)", sample: "p", property: "margin-bottom", units: ["px", "em", "rem"], min: 0 },
      { id: "measure", label: "Largeur max. des paragraphes", selector: "p", sample: "p", property: "max-width", units: ["ch", "px"], min: 0 },
    ],
  },
  {
    title: "Titres",
    settings: [
      { id: "h1-size", label: "Taille h1", selector: "h1", sample: "h1", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "h2-size", label: "Taille h2", selector: "h2", sample: "h2", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "h3-size", label: "Taille h3", selector: "h3", sample: "h3", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "heading-leading", label: "Interligne des titres", selector: HEADINGS, sample: "h1, h2, h3", property: "line-height", units: ["", "px"], step: 0.05, min: 0 },
      { id: "heading-gap", label: "Espace sous les titres", selector: HEADINGS, sample: "h1, h2, h3", property: "margin-bottom", units: ["px", "em", "rem"], min: 0 },
    ],
  },
  {
    title: "Boutons",
    settings: [
      { id: "button-radius", label: "Arrondi", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "border-radius", readProperty: "border-top-left-radius", units: ["px", "rem", "%"], min: 0 },
      { id: "button-py", label: "Marge verticale", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "padding-block", readProperty: "padding-top", units: ["px", "rem", "em"], min: 0 },
      { id: "button-px", label: "Marge horizontale", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "padding-inline", readProperty: "padding-left", units: ["px", "rem", "em"], min: 0 },
      { id: "button-size", label: "Taille du texte", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "font-size", units: ["px", "rem"], min: 1 },
    ],
  },
  {
    title: "Champs et images",
    settings: [
      { id: "field-radius", label: "Arrondi des champs", selector: FIELDS, sample: "input, select, textarea", property: "border-radius", readProperty: "border-top-left-radius", units: ["px", "rem"], min: 0 },
      { id: "image-radius", label: "Arrondi des images", selector: "img, video, picture", sample: "img, video", property: "border-radius", readProperty: "border-top-left-radius", units: ["px", "rem", "%"], min: 0 },
    ],
  },
];
