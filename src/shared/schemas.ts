import { z } from "zod";

/** Schémas de validation de tout ce qui arrive du navigateur vers le serveur. */

const fontRef = z.object({
  source: z.enum(["local", "google"]),
  family: z.string().min(1).max(200),
});

const cssText = z.string().max(2000);
/** Les textes réécrits peuvent être plus longs qu'une valeur CSS. */
const contentText = z.string().max(20000);

const target = z.object({
  selector: cssText.min(1),
  label: z.string().max(300),
  scope: z.enum(["element", "similar", "tag", "role", "global"]),
  context: z
    .object({
      tag: z.string().max(50),
      classes: z.array(z.string().max(200)).max(100),
      text: z.string().max(300),
      count: z.number().int().nonnegative(),
    })
    .nullable(),
});

export const changeSchema = z.object({
  id: z.string().min(1).max(100),
  group: z.enum(["inspect", "system", "fonts", "vars", "swap", "text"]),
  target,
  property: z.string().min(1).max(100),
  value: contentText,
  previous: contentText.nullable(),
  font: fontRef.nullable(),
});

export const sessionSchema = z.object({
  changes: z.array(changeSchema).max(2000),
});

const hexOrCss = z.string().min(1).max(100);

export const configSchema = z.object({
  language: z.enum(["auto", "fr", "en"]).default("auto"),
  fontFolders: z.array(z.string().min(1).max(1000)).max(50),
  googleFonts: z.boolean(),
  palettes: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        name: z.string().max(100),
        colors: z.array(hexOrCss).max(40),
      }),
    )
    .max(200),
  favorites: z.array(z.string().max(300)).max(500),
  pairings: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        name: z.string().max(100),
        roles: z.partialRecord(
          z.enum(["headings", "body", "buttons"]),
          z.object({
            font: fontRef,
            weight: z.number().min(1).max(1000),
            style: z.enum(["normal", "italic"]),
          }),
        ),
      }),
    )
    .max(200),
});

export const validateSchema = z.object({
  mode: z.enum(["claude", "export"]),
  language: z.enum(["fr", "en"]).default("fr"),
  changes: z.array(changeSchema).min(1).max(2000),
});

export const DEFAULT_CONFIG: z.infer<typeof configSchema> = {
  language: "auto",
  fontFolders: [],
  googleFonts: true,
  palettes: [],
  favorites: [],
  pairings: [],
};
