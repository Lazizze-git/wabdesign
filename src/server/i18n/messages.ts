/**
 * Messages du serveur (terminal et réponses au panneau), en français et en anglais.
 * Français : espaces fines insécables (U+202F) avant : ; ! ? et dans « », apostrophe ’.
 * Les {noms} entre accolades sont remplacés par msg().
 */
export const fr = {
  cliHelp: `wabdesign — panneau de design en direct par-dessus ta preview locale.

Utilisation (dans le dossier du projet) :
  wabdesign              trouve la preview du projet et ouvre le panneau
  wabdesign 3000         utilise la preview sur localhost:3000
  wabdesign 3000 --port 4100 --no-open
  wabdesign setup        installe la commande /wabdesign dans Claude Code
  wabdesign --version

Dans le navigateur : Option + D (Alt + D) affiche ou cache le panneau.`,
  versionUnknown: "inconnue",
  fallbackPort: "Aucune preview lancée depuis ce dossier : j’utilise celle du port {port}. Si ce n’est pas le bon projet, indique le port : wabdesign 3000",
  alreadyRunning: "Le panneau tourne déjà pour ce projet : {url}",
  noPreview: "Aucune preview détectée. Lance d’abord ton serveur (npm run dev), ou indique son port : wabdesign 3000",
  ready: "Preview avec panneau de design : {url}",
  relay: "Relaie localhost:{port} · projet : {dir}",
  shortcutHint: "Option + D (Alt + D) dans le navigateur pour afficher ou cacher le panneau.",
  claudeMissing: "Claude Code introuvable : la validation enregistrera seulement la fiche des modifications.",
  startFailed: "Démarrage impossible : {error}",
  serverError: "Erreur du serveur local",
  skillInstalled: "Commande /wabdesign installée dans Claude Code ({path})",
  skillNext: "Ouvre une nouvelle conversation Claude Code puis tape /wabdesign dans ton projet.",
  openManually: "Ouvre cette adresse dans ton navigateur : {url}",
  jsonInvalid: "Fichier ignoré car invalide : {file}",
  jsonUnreadable: "Fichier illisible : {file} ({error})",
  pageUnreadableLog: "Page illisible, panneau non injecté ({error})",
  pageUnreadable: "wabdesign : la page de la preview n’a pas pu être lue.",
  previewDownTitle: "Preview introuvable",
  previewDownHeading: "La preview ne répond pas",
  previewDownBody: "Aucun serveur ne répond sur <b>{origin}</b>. Relance ton serveur de développement, puis recharge cette page.",
  validateLog: "Application des modifications par Claude Code ({file})",
  validateDoneLog: "Modifications appliquées dans le code.",
  validateFailedLog: "La validation a échoué",
  errInvalidData: "Données invalides",
  errInvalidJson: "JSON invalide",
  errBodyTooLarge: "Requête trop volumineuse",
  errFontNotFound: "Police introuvable",
  errClaudeMissing: "Claude Code est introuvable sur cet ordinateur.",
  errUnknownRoute: "Route inconnue",
  errNotFound: "Introuvable",
  errAccessDenied: "Accès refusé",
  errPickFolderMac: "Le sélecteur de dossier n’existe que sur macOS : colle le chemin à la main.",
  scanUnreadableFont: "{file} : fichier de police illisible ({error})",
  scanFolderUnreachable: "Dossier inaccessible : {folder} ({error})",
  scanCacheNotSaved: "Cache des polices non enregistré ({error})",
  googleUnavailable: "Google Fonts indisponible ({error})",
  googleStatus: "Google Fonts a répondu {status}",
  validateBusy: "Une validation est déjà en cours.",
  briefSaved: "Fiche enregistrée : {file}",
  exportDone: "Fiche prête. Demande à Claude Code de l’appliquer.",
  claudeApplying: "Claude Code applique les modifications dans le code…",
  validateDone: "Modifications appliquées.",
  claudePrompt: "Lis le fichier {file} et applique dans le code source de ce projet les modifications de design qu’il décrit, en suivant ses consignes à la lettre.",
  stepEdit: "Modifie {file}",
  stepEditAny: "Modifie un fichier",
  stepRead: "Lit {file}",
  stepSearch: "Cherche dans le projet…",
  stepCopyFonts: "Copie les fichiers de police…",
  claudeLaunchFailed: "Impossible de lancer Claude Code ({error})",
  claudeFailed: "Claude Code n’a pas pu terminer : {reason}",
  claudeExitCode: "code de sortie {code}",
  unknown: "inconnu",
};

export type MessageKey = keyof typeof fr;

export const en: Record<MessageKey, string> = {
  cliHelp: `wabdesign — live design panel on top of your local preview.

Usage (in the project folder):
  wabdesign              finds the project's preview and opens the panel
  wabdesign 3000         uses the preview on localhost:3000
  wabdesign 3000 --port 4100 --no-open
  wabdesign setup        installs the /wabdesign command in Claude Code
  wabdesign --version

In the browser: Option + D (Alt + D) shows or hides the panel.`,
  versionUnknown: "unknown",
  fallbackPort: "No preview started from this folder: using the one on port {port}. If it is the wrong project, pass the port: wabdesign 3000",
  alreadyRunning: "The panel is already running for this project: {url}",
  noPreview: "No preview detected. Start your dev server first (npm run dev), or pass its port: wabdesign 3000",
  ready: "Preview with design panel: {url}",
  relay: "Relaying localhost:{port} · project: {dir}",
  shortcutHint: "Option + D (Alt + D) in the browser shows or hides the panel.",
  claudeMissing: "Claude Code not found: validating will only save the change sheet.",
  startFailed: "Could not start: {error}",
  serverError: "Local server error",
  skillInstalled: "/wabdesign command installed in Claude Code ({path})",
  skillNext: "Open a new Claude Code conversation, then type /wabdesign in your project.",
  openManually: "Open this address in your browser: {url}",
  jsonInvalid: "File ignored because it is invalid: {file}",
  jsonUnreadable: "Unreadable file: {file} ({error})",
  pageUnreadableLog: "Unreadable page, panel not injected ({error})",
  pageUnreadable: "wabdesign: the preview page could not be read.",
  previewDownTitle: "Preview not found",
  previewDownHeading: "The preview is not responding",
  previewDownBody: "No server is responding on <b>{origin}</b>. Restart your dev server, then reload this page.",
  validateLog: "Claude Code is applying the changes ({file})",
  validateDoneLog: "Changes applied to the code.",
  validateFailedLog: "Validation failed",
  errInvalidData: "Invalid data",
  errInvalidJson: "Invalid JSON",
  errBodyTooLarge: "Request too large",
  errFontNotFound: "Font not found",
  errClaudeMissing: "Claude Code cannot be found on this computer.",
  errUnknownRoute: "Unknown route",
  errNotFound: "Not found",
  errAccessDenied: "Access denied",
  errPickFolderMac: "The folder picker only exists on macOS: paste the path instead.",
  scanUnreadableFont: "{file}: unreadable font file ({error})",
  scanFolderUnreachable: "Folder not accessible: {folder} ({error})",
  scanCacheNotSaved: "Font cache not saved ({error})",
  googleUnavailable: "Google Fonts unavailable ({error})",
  googleStatus: "Google Fonts answered {status}",
  validateBusy: "A validation is already running.",
  briefSaved: "Change sheet saved: {file}",
  exportDone: "Sheet ready. Ask Claude Code to apply it.",
  claudeApplying: "Claude Code is applying the changes to the code…",
  validateDone: "Changes applied.",
  claudePrompt: "Read the file {file} and apply the design changes it describes to this project's source code, following its instructions exactly.",
  stepEdit: "Editing {file}",
  stepEditAny: "Editing a file",
  stepRead: "Reading {file}",
  stepSearch: "Searching the project…",
  stepCopyFonts: "Copying font files…",
  claudeLaunchFailed: "Could not start Claude Code ({error})",
  claudeFailed: "Claude Code could not finish: {reason}",
  claudeExitCode: "exit code {code}",
  unknown: "unknown",
};
