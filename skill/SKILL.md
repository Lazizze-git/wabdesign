---
name: wabdesign
description: Opens the live design panel (the "wabdesign" tool) on top of the current project's local preview, to try fonts, colors, design-system variables, copy and element tweaks, then apply them to the code. Use when the user types /wabdesign, or asks to "open the design panel", "launch wabdesign", "try fonts / colors live on the preview" (also in French: « ouvrir le panneau de design », « lancer wabdesign »).
argument-hint: "[preview port | stop]"
---

# /wabdesign — open the design panel on the preview

`wabdesign` is a local relay: it shows the project's preview with a panel on top
(Fonts, Colors, Inspect, Design system, Changes). It runs **from the project folder**
(that folder is the one "Apply" will change) and stays up while the session runs.

Reply in the user's language, plainly, without technical jargon.

## If the argument is `stop`

Stop the `wabdesign` background task started in this session (and only that one). If there is none,
find the process listening on the panel port (`lsof -nP -iTCP:4000 -sTCP:LISTEN`), check that it is
`wabdesign` for this project, then stop it. Confirm in one sentence. Never touch the preview server.

## Otherwise: open the panel

1. **Check that the tool is installed**: `command -v wabdesign`.
   If it is missing, offer to install it (`npm install -g https://github.com/Lazizze-git/wabdesign/releases/latest/download/wabdesign.tgz`, Node 20 or later)
   and install it if the user agrees.

2. **Start the tool in the project folder**, as a background task (`run_in_background: true`):
   - with a port given as argument: `wabdesign <port>`;
   - otherwise: `wabdesign` (it finds the preview started from this folder, and reopens the panel if it is already running).

   Then read the task output to get the panel address. The tool prints in English or French depending on its settings:
   `Preview with design panel: http://localhost:…` / `Preview avec panneau de design : http://localhost:…`,
   or `The panel is already running for this project: …` / `Le panneau tourne déjà pour ce projet : …`.
   The browser opens on that address by itself.

3. **If the output says "No preview detected" / « Aucune preview détectée »**: the project's preview is not running.
   - Read `package.json` to find the dev script (`dev`, otherwise `start`).
   - Pick a free port (check with `lsof -nP -iTCP:<port> -sTCP:LISTEN`), starting at 3000.
   - Start the preview as a background task from the project folder, on that port:
     Next.js `npm run dev -- -p <port>` · Vite / Astro `npm run dev -- --port <port>` · otherwise: the script as is.
   - Wait for the "Ready" / "Local:" line in its output, then start `wabdesign <port>` in the background (step 2).
   - If `node_modules` is missing, run `npm install` first.

4. **If the output says "No preview started from this folder: using the one on port …"** (« Aucune preview lancée depuis ce dossier »),
   check that this port belongs to this project. If not, stop that task and follow step 3.

## Final message (short)

- the address to use (e.g. `http://localhost:4000`), making clear it is this one and not the bare preview;
- the shortcuts: **⌥ D** show/hide · **⌥ S** pick an element · **⌥ A** (hold) show original · **⌘ Z** undo
  (Alt and Ctrl on Windows and Linux);
- the panel follows the browser language (English or French) and can be switched in its settings (gear icon);
- "Apply" writes the changes into the code. If the project has no Git backup
  (`git rev-parse --is-inside-work-tree` fails), say so in one sentence and offer to create one before applying.

## If something goes wrong

- The page shows an error from the site itself (missing keys, database…): that is the project, not the tool. Say so clearly;
  the panel still works on whatever is displayed.
- "Port in use" or tool not found: redo the matching step; never stop a process that does not belong to this project.
