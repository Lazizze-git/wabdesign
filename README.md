# wabdesign

A design panel that opens on top of your site's local preview (`localhost:3000`,
`localhost:5173`…). You change fonts, colors, design-system variables, spacing, corner radius
and copy, and see the result in the page right away. When you like it, "Apply" asks
[Claude Code](https://claude.com/claude-code) to write the changes into the project's code.

![The wabdesign panel open on the WeAreBrothers studio site: the Design system tab lists its 144 CSS variables](docs/apercu.jpg)

Built to work alongside Claude Code: you ask it for a site, it starts the preview, you type
`/wabdesign`, adjust the design by hand, and it applies the result to the code.

The panel speaks English and French. It follows your browser's language, and you can switch
it in the settings (gear icon).

## What the panel does

| Tab | What it is for |
|---|---|
| **Fonts** | Pick the font for headings, body text and buttons, from your own font files and the Google Fonts catalog. Weight, italic, variable-font axes, line height, letter spacing. Save pairings, or shuffle one from your favorites. |
| **Colors** | Build palettes (paste color codes or a coolors.co link), then replace any color of the site, everywhere, hover states included. |
| **Inspect** | Click an element in the page and adjust its text, font, colors, radius and spacing. For that element only, for similar elements, or for every element of the same type. |
| **Design system** | Every CSS variable of the site, grouped by family (colors, typography, radius, spacing, shadows). Changing one changes everything that uses it. "By element type" sets one value for all paragraphs, all buttons, and so on. |
| **Changes** | Everything you changed, with a button to remove each change, then "Apply". |

Nothing touches your code until you click "Apply". Your changes survive a page reload or a
restart of the tool.

## Installation

You need [Node.js](https://nodejs.org) 20 or later.

```bash
npm install -g https://github.com/Lazizze-git/wabdesign/releases/latest/download/wabdesign.tgz
wabdesign setup
```

The first command installs the tool. The second adds the `/wabdesign` command to Claude Code.
Open a new Claude Code conversation for it to show up.

## Usage

### From Claude Code (easiest)

In your project's conversation, type:

```
/wabdesign
```

Claude finds the project's preview (and starts it if it is not running), then opens the panel
in your browser. `/wabdesign 3000` targets the preview on a given port, `/wabdesign stop` closes the panel.

### From a terminal

Start your preview as usual (`npm run dev`), then, **in the project folder**:

```bash
wabdesign          # finds the preview started from this folder
wabdesign 3000     # or pass its port
```

The browser opens `http://localhost:4000`: your page, with the panel on top. Use this address,
not the bare preview's. Your dev server's hot reload keeps working.

### Shortcuts

| Shortcut | Action |
|---|---|
| ⌥ D (Alt + D) | Show or hide the panel |
| ⌥ S (Alt + S) | Pick an element in the page to edit it |
| ⌥ A (Alt + A), held | Show original: the site without your changes |
| ⌘ Z / ⇧ ⌘ Z (Ctrl + Z / Ctrl + Shift + Z) | Undo / redo |

Drag the panel by its header to move it. The – button shrinks it to a small pill.

## Your fonts

In the panel's settings (gear icon), add one or more font folders (`.otf`, `.ttf`, `.woff`,
`.woff2`, subfolders included). On a Mac, the "Choose a folder" button opens Finder. A Google
Drive folder synced to your computer works like any other folder. The Google Fonts catalog is
available on top of that, and can be turned off.

These settings, your palettes, favorites and pairings are shared across all your projects
(`~/.config/outil-design/`). The interface language is set there too.

## What "Apply" does

1. The tool writes a change sheet describing each change (target element, old and new value)
   into the project's `.design-tool/` folder. That folder ignores itself in Git.
2. It runs Claude Code in the project with that sheet. Claude changes each value at its source
   (variable, Tailwind theme, component), copies the local fonts you used into the project, and
   touches nothing else. You follow its progress in the panel.
3. Without Claude Code, "Save the change sheet only" produces the same document, to hand to the
   tool of your choice.

Tip: commit your project with Git before applying, so you can go back.

## Privacy and security

- Everything runs on your computer. The relay only listens on `127.0.0.1` and refuses requests
  coming from other sites open in your browser.
- The only internet access is the Google Fonts catalog and font files (can be turned off).
- "Apply" runs Claude Code with your account, limited to reading and writing files in the
  project and copying fonts.

## Known limits

- Sites that hard-code their values, without CSS variables, show nothing in the Design system
  tab: use Inspect and "By element type" instead.
- With Tailwind 4 in `@theme inline` mode, changing a variable does not change the display:
  the values are copied into the classes.
- The Finder folder picker only exists on macOS. Elsewhere, paste the folder path.

## Update, uninstall

```bash
# update (same command as the installation)
npm install -g https://github.com/Lazizze-git/wabdesign/releases/latest/download/wabdesign.tgz

# uninstall
npm uninstall -g wabdesign
rm -rf ~/.claude/skills/wabdesign
```

## Contributing

```bash
git clone https://github.com/Lazizze-git/wabdesign.git
cd wabdesign
npm install
npm run dev      # rebuilds on every change
npm run check    # types, lint rules, tests
npm run build    # regenerates dist/ (commit it)
```

To publish a version: bump `version` in `package.json`, run `npm run build`, commit, then
`npm pack` and attach the file, renamed `wabdesign.tgz`, to a GitHub release
(`gh release create vX.Y.Z wabdesign.tgz`).

The code is TypeScript: the relay server lives in `src/server`, the panel (Preact, inside a
Shadow DOM) in `src/client`. The panel's visual choices are explained in `DESIGN.md`.

## License

MIT, see [LICENSE](LICENSE).
