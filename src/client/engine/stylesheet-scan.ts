import { colorKey, isColorLiteral } from "./colors";
import { isLibraryToken } from "./sheet-origin";
import { walkStylesheets, type RuleContext } from "./sheet-walker";

export { OWN_NODE_PREFIX } from "./sheet-walker";

/** Une déclaration de couleur trouvée dans les feuilles de style de la page. */
export interface ColorDeclaration {
  wrappers: string[];
  selector: string;
  property: string;
  value: string;
  key: string;
}

export interface ColorVariable {
  name: string;
  value: string;
  key: string;
  selectors: string[];
  uses: number;
  /** Variable d’une extension ou d’une bibliothèque, pas du site. */
  external: boolean;
}

/** Une variable CSS (couleur, police, taille, arrondi…) : la matière du design system. */
export interface DesignToken {
  name: string;
  value: string;
  selectors: string[];
  uses: number;
  external: boolean;
}

export interface SheetScan {
  declarations: ColorDeclaration[];
  variables: ColorVariable[];
  tokens: DesignToken[];
  /** Nombre d’utilisations de chaque couleur du site (clé hex), variables comprises. */
  usage: Map<string, number>;
}

const COLOR_PROPERTIES = new Set([
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "fill",
  "stroke",
  "caret-color",
  "accent-color",
  "column-rule-color",
]);

/** Le site l’emporte : une variable définie par le site et par une bibliothèque compte comme celle du site. */
function record<T extends { selectors: string[]; external: boolean }>(
  map: Map<string, T>,
  name: string,
  create: () => T,
  selector: string,
  external: boolean,
): void {
  const entry = map.get(name) ?? create();
  if (!entry.selectors.includes(selector)) entry.selectors.push(selector);
  entry.external = entry.external && external;
  map.set(name, entry);
}

/** Parcourt toutes les feuilles de style de la page et relève couleurs et variables. */
export function scanStylesheets(doc: Document = document): SheetScan {
  const declarations: (ColorDeclaration & { external: boolean })[] = [];
  const variables = new Map<string, ColorVariable>();
  const tokens = new Map<string, DesignToken>();
  const references = new Map<string, number>();

  walkStylesheets(doc, (style: CSSStyleDeclaration, selector: string, context: RuleContext) => {
    // Les raccourcis (« background: var(--x) ») ne se relisent pas via leurs propriétés détaillées.
    for (const match of style.cssText.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (match[1]) references.set(match[1], (references.get(match[1]) ?? 0) + 1);
    }
    for (let index = 0; index < style.length; index += 1) {
      const property = style.item(index);
      const value = style.getPropertyValue(property).trim();
      const isVariable = property.startsWith("--");
      const external = context.external || (isVariable && isLibraryToken(property));
      // Les variables internes de Tailwind (--tw-…) ne sont pas des choix de design.
      if (isVariable && !property.startsWith("--tw-") && value !== "") {
        record(tokens, property, () => ({ name: property, value, selectors: [], uses: 0, external }), selector, external);
      }
      if (!isVariable && !COLOR_PROPERTIES.has(property)) continue;
      if (!isColorLiteral(value)) continue;
      const key = colorKey(value);
      if (!key) continue;
      declarations.push({ wrappers: context.wrappers, selector, property, value, key, external });
      if (!isVariable) continue;
      record(variables, property, () => ({ name: property, value, key, selectors: [], uses: 0, external }), selector, external);
    }
  });

  const usage = new Map<string, number>();
  for (const variable of variables.values()) variable.uses = references.get(variable.name) ?? 0;
  for (const token of tokens.values()) token.uses = references.get(token.name) ?? 0;
  for (const declaration of declarations) {
    if (declaration.external) continue; // Les couleurs d’une extension ne sont pas celles du site.
    const weight = declaration.property.startsWith("--") ? Math.max(1, references.get(declaration.property) ?? 0) : 1;
    usage.set(declaration.key, (usage.get(declaration.key) ?? 0) + weight);
  }
  const sortedVariables = [...variables.values()].sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name));
  return { declarations, variables: sortedVariables, tokens: [...tokens.values()], usage };
}
