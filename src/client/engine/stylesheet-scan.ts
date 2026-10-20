import { colorKey, isColorLiteral } from "./colors";

/** Une déclaration de couleur trouvée dans les feuilles de style du site. */
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
}

/** Une variable CSS du site (couleur, police, taille, arrondi…) : la matière du design system. */
export interface DesignToken {
  name: string;
  value: string;
  selectors: string[];
  uses: number;
}

export interface SheetScan {
  declarations: ColorDeclaration[];
  variables: ColorVariable[];
  tokens: DesignToken[];
  /** Nombre d'utilisations de chaque couleur (clé hex), variables comprises. */
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

export const OWN_NODE_PREFIX = "__od";

function wrapperOf(rule: CSSRule): string | null {
  if (rule instanceof CSSMediaRule) return `@media ${rule.conditionText}`;
  if (rule instanceof CSSSupportsRule) return `@supports ${rule.conditionText}`;
  if (typeof CSSContainerRule !== "undefined" && rule instanceof CSSContainerRule) {
    return `@container ${rule.containerName} ${rule.containerQuery}`.replace(/\s+/g, " ");
  }
  return null;
}

function readSheetRules(sheet: CSSStyleSheet): CSSRuleList | null {
  const owner = sheet.ownerNode;
  if (owner instanceof Element && owner.id.startsWith(OWN_NODE_PREFIX)) return null;
  try {
    return sheet.cssRules;
  } catch {
    return null; // Feuille d'un autre domaine : illisible, on l'ignore.
  }
}

/** Parcourt toutes les feuilles de style de la page et relève couleurs et variables de couleur. */
export function scanStylesheets(doc: Document = document): SheetScan {
  const declarations: ColorDeclaration[] = [];
  const variables = new Map<string, ColorVariable>();
  const tokens = new Map<string, DesignToken>();
  const references = new Map<string, number>();

  const visitStyle = (rule: CSSStyleRule, wrappers: string[]): void => {
    const style = rule.style;
    // Les raccourcis (« background: var(--x) ») ne se relisent pas via leurs propriétés détaillées.
    for (const match of style.cssText.matchAll(/var\(\s*(--[\w-]+)/g)) {
      if (match[1]) references.set(match[1], (references.get(match[1]) ?? 0) + 1);
    }
    for (let index = 0; index < style.length; index += 1) {
      const property = style.item(index);
      const value = style.getPropertyValue(property).trim();
      const isVariable = property.startsWith("--");
      // Les variables internes de Tailwind (--tw-…) ne sont pas des choix de design.
      if (isVariable && !property.startsWith("--tw-") && value !== "") {
        const token = tokens.get(property) ?? { name: property, value, selectors: [], uses: 0 };
        if (!token.selectors.includes(rule.selectorText)) token.selectors.push(rule.selectorText);
        tokens.set(property, token);
      }
      if (!isVariable && !COLOR_PROPERTIES.has(property)) continue;
      if (!isColorLiteral(value)) continue;
      const key = colorKey(value);
      if (!key) continue;
      declarations.push({ wrappers, selector: rule.selectorText, property, value, key });
      if (!isVariable) continue;
      const variable = variables.get(property) ?? { name: property, value, key, selectors: [], uses: 0 };
      if (!variable.selectors.includes(rule.selectorText)) variable.selectors.push(rule.selectorText);
      variables.set(property, variable);
    }
  };

  const visit = (rules: CSSRuleList, wrappers: string[]): void => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) {
        visitStyle(rule, wrappers);
        continue;
      }
      const wrapper = wrapperOf(rule);
      if (wrapper !== null || rule instanceof CSSLayerBlockRule) {
        const nested = (rule as CSSGroupingRule).cssRules;
        visit(nested, wrapper ? [...wrappers, wrapper] : wrappers);
      }
    }
  };

  for (const sheet of Array.from(doc.styleSheets)) {
    const rules = readSheetRules(sheet);
    if (rules) visit(rules, []);
  }

  const usage = new Map<string, number>();
  for (const variable of variables.values()) variable.uses = references.get(variable.name) ?? 0;
  for (const token of tokens.values()) token.uses = references.get(token.name) ?? 0;
  for (const declaration of declarations) {
    const weight = declaration.property.startsWith("--") ? Math.max(1, references.get(declaration.property) ?? 0) : 1;
    usage.set(declaration.key, (usage.get(declaration.key) ?? 0) + weight);
  }
  const sortedVariables = [...variables.values()].sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name));
  return { declarations, variables: sortedVariables, tokens: [...tokens.values()], usage };
}
