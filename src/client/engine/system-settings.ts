import type { MessageKey } from "../i18n";
/** Réglages globaux du « design system » : une valeur appliquée à toute une famille d'éléments. */
export interface SystemSetting {
  id: string;
  label: MessageKey;
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
  title: MessageKey;
  settings: readonly SystemSetting[];
}

const BUTTONS = 'button, [role="button"], input[type="submit"], input[type="button"]';
const BUTTON_SAMPLE = 'button, [role="button"]';
const FIELDS = 'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), select, textarea';
const HEADINGS = "h1, h2, h3, h4, h5, h6";

export const SYSTEM_GROUPS: readonly SystemGroup[] = [
  {
    title: "group.text",
    settings: [
      { id: "body-size", label: "set.bodySize", selector: "body, p, li", sample: "p, li, body", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "body-leading", label: "set.bodyLeading", selector: "p, li", sample: "p, li", property: "line-height", units: ["", "px"], step: 0.05, min: 0 },
      { id: "paragraph-gap", label: "set.paragraphGap", selector: "p:not(:last-child)", sample: "p", property: "margin-bottom", units: ["px", "em", "rem"], min: 0 },
      { id: "measure", label: "set.measure", selector: "p", sample: "p", property: "max-width", units: ["ch", "px"], min: 0 },
    ],
  },
  {
    title: "group.headings",
    settings: [
      { id: "h1-size", label: "set.h1", selector: "h1", sample: "h1", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "h2-size", label: "set.h2", selector: "h2", sample: "h2", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "h3-size", label: "set.h3", selector: "h3", sample: "h3", property: "font-size", units: ["px", "rem"], min: 1 },
      { id: "heading-leading", label: "set.headingLeading", selector: HEADINGS, sample: "h1, h2, h3", property: "line-height", units: ["", "px"], step: 0.05, min: 0 },
      { id: "heading-gap", label: "set.headingGap", selector: HEADINGS, sample: "h1, h2, h3", property: "margin-bottom", units: ["px", "em", "rem"], min: 0 },
    ],
  },
  {
    title: "group.buttons",
    settings: [
      { id: "button-radius", label: "set.buttonRadius", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "border-radius", readProperty: "border-top-left-radius", units: ["px", "rem", "%"], min: 0 },
      { id: "button-py", label: "set.buttonPy", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "padding-block", readProperty: "padding-top", units: ["px", "rem", "em"], min: 0 },
      { id: "button-px", label: "set.buttonPx", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "padding-inline", readProperty: "padding-left", units: ["px", "rem", "em"], min: 0 },
      { id: "button-size", label: "set.buttonSize", selector: BUTTONS, sample: BUTTON_SAMPLE, property: "font-size", units: ["px", "rem"], min: 1 },
    ],
  },
  {
    title: "group.fields",
    settings: [
      { id: "field-radius", label: "set.fieldRadius", selector: FIELDS, sample: "input, select, textarea", property: "border-radius", readProperty: "border-top-left-radius", units: ["px", "rem"], min: 0 },
      { id: "image-radius", label: "set.imageRadius", selector: "img, video, picture", sample: "img, video", property: "border-radius", readProperty: "border-top-left-radius", units: ["px", "rem", "%"], min: 0 },
    ],
  },
];
