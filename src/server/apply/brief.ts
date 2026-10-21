import type { Change, ChangeGroup, Language } from "../../shared/types";
import type { FaceRecord } from "../fonts/read-font";
import { BRIEF_TEXT, type BriefText } from "./brief-text";

const GROUP_ORDER: readonly ChangeGroup[] = ["fonts", "system", "vars", "swap", "inspect", "text"];

function quote(text: string | null, words: BriefText): string {
  return `${words.open}${(text ?? "").replace(/\s+/g, " ").trim()}${words.close}`;
}

function describeTarget(change: Change, words: BriefText): string {
  const { target } = change;
  const parts = [
    `**${target.label}**`,
    `${words.scope}${words.scopes[target.scope]}`,
    `${words.selector}\`${target.selector}\``,
  ];
  const context = target.context;
  if (context) {
    const classes = context.classes.length > 0 ? ` class="${context.classes.join(" ")}"` : "";
    parts.push(`\`<${context.tag}${classes}>\``);
    if (context.text) parts.push(`${words.text}${quote(context.text, words)}`);
    parts.push(`${context.count} ${words.inPage}`);
  }
  return parts.join(" · ");
}

function describeChange(change: Change, words: BriefText): string {
  if (change.group === "text") {
    return `- ${describeTarget(change, words)}${words.colon} ${quote(change.previous, words)} → ${quote(change.value, words)}`;
  }
  if (change.group === "swap") return `- \`${change.previous ?? "?"}\` → \`${change.value}\``;
  const before = change.previous ? ` (${words.before}\`${change.previous}\`)` : "";
  return `- ${describeTarget(change, words)}${words.colon} \`${change.property}\` → \`${change.value}\`${before}`;
}

function fontFilesSection(localFonts: ReadonlyMap<string, FaceRecord[]>, words: BriefText): string {
  if (localFonts.size === 0) return "";
  const lines = [`## ${words.fontFiles}`];
  for (const [family, faces] of localFonts) {
    lines.push(`### ${family}`);
    for (const face of faces) {
      const weight = face.weightRange ? `variable ${face.weightRange[0]}–${face.weightRange[1]}` : `${face.weight}`;
      lines.push(`- ${weight} ${face.style} (${face.format})${words.colon} \`${face.path}\``);
    }
  }
  return lines.join("\n");
}

/** Rédige la fiche (Markdown) que Claude Code lira pour appliquer les modifications, dans la langue du panneau. */
export function buildBrief(
  changes: readonly Change[],
  localFonts: ReadonlyMap<string, FaceRecord[]>,
  date: Date,
  language: Language,
): string {
  const words = BRIEF_TEXT[language];
  const sections = [`# ${words.title} — ${date.toLocaleString(words.locale)}`, words.rules];
  for (const group of GROUP_ORDER) {
    const items = changes.filter((change) => change.group === group);
    if (items.length === 0) continue;
    sections.push(`## ${words.groups[group]}\n${items.map((change) => describeChange(change, words)).join("\n")}`);
  }
  const files = fontFilesSection(localFonts, words);
  if (files) sections.push(files);
  return `${sections.join("\n\n")}\n`;
}
