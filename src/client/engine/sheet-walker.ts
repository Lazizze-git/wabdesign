import { isExternalSheet } from "./sheet-origin";

export const OWN_NODE_PREFIX = "__od";

/** Contexte d’une règle : @media/@supports qui l’entourent, et origine de sa feuille. */
export interface RuleContext {
  wrappers: string[];
  external: boolean;
}

export type StyleVisitor = (style: CSSStyleDeclaration, selector: string, context: RuleContext) => void;

function wrapperOf(rule: CSSRule): string | null {
  if (rule instanceof CSSMediaRule) return `@media ${rule.conditionText}`;
  if (rule instanceof CSSSupportsRule) return `@supports ${rule.conditionText}`;
  if (typeof CSSContainerRule !== "undefined" && rule instanceof CSSContainerRule) {
    return `@container ${rule.containerName} ${rule.containerQuery}`.replace(/\s+/g, " ");
  }
  return null;
}

function readRules(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules;
  } catch {
    return null; // Feuille d’un autre domaine : illisible, on l’ignore.
  }
}

/** CSS imbriqué : « .carte { &:hover {…} .titre {…} } » → « :is(.carte):hover », « :is(.carte) .titre ». */
export function resolveNested(parent: string | null, child: string): string {
  if (!parent) return child;
  return child
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      return trimmed.includes("&") ? trimmed.replaceAll("&", `:is(${parent})`) : `:is(${parent}) ${trimmed}`;
    })
    .join(", ");
}

function visitRules(rules: CSSRuleList, context: RuleContext, parent: string | null, visit: StyleVisitor, depth: number): void {
  if (depth > 12) return; // Garde-fou contre des imports qui se répondent.
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      const selector = resolveNested(parent, rule.selectorText);
      visit(rule.style, selector, context);
      if (rule.cssRules.length > 0) visitRules(rule.cssRules, context, selector, visit, depth + 1);
      continue;
    }
    if (rule instanceof CSSImportRule) {
      const imported = rule.styleSheet;
      const importedRules = imported ? readRules(imported) : null;
      if (!imported || !importedRules) continue;
      const media = rule.media.mediaText;
      visitRules(
        importedRules,
        {
          wrappers: media ? [...context.wrappers, `@media ${media}`] : context.wrappers,
          external: context.external || isExternalSheet(imported),
        },
        parent,
        visit,
        depth + 1,
      );
      continue;
    }
    const wrapper = wrapperOf(rule);
    if (wrapper !== null || rule instanceof CSSLayerBlockRule) {
      const nextContext = wrapper ? { ...context, wrappers: [...context.wrappers, wrapper] } : context;
      visitRules((rule as CSSGroupingRule).cssRules, nextContext, parent, visit, depth + 1);
    }
  }
}

/** Parcourt toutes les règles de style de la page : imports, @media, couches et CSS imbriqué compris. */
export function walkStylesheets(doc: Document, visit: StyleVisitor): void {
  for (const sheet of Array.from(doc.styleSheets)) {
    const owner = sheet.ownerNode;
    if (owner instanceof Element && owner.id.startsWith(OWN_NODE_PREFIX)) continue;
    const rules = readRules(sheet);
    if (rules) visitRules(rules, { wrappers: [], external: isExternalSheet(sheet, doc) }, null, visit, 0);
  }
}
