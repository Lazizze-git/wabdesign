import { rmSync } from "node:fs";
import { context, build, type BuildOptions } from "esbuild";

const watch: boolean = process.argv.includes("--watch");

const server: BuildOptions = {
  entryPoints: ["src/server/cli.ts"],
  outfile: "dist/cli.js",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  // Tout est emballé dans un seul fichier : l'installation depuis GitHub n'a rien à compiler.
  banner: { js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);' },
  minify: !watch,
  legalComments: "external",
  sourcemap: false,
};

const client: BuildOptions = {
  entryPoints: ["src/client/main.tsx"],
  outfile: "dist/panel.js",
  bundle: true,
  platform: "browser",
  format: "iife",
  target: "es2022",
  jsx: "automatic",
  jsxImportSource: "preact",
  minify: !watch,
  sourcemap: watch ? "inline" : false,
};

if (watch) {
  const contexts = await Promise.all([context(server), context(client)]);
  await Promise.all(contexts.map((ctx) => ctx.watch()));
  process.stdout.write("Compilation en continu…\n");
} else {
  rmSync("dist", { recursive: true, force: true });
  await Promise.all([build(server), build(client)]);
  process.stdout.write("Compilation terminée.\n");
}
