import { execFile } from "node:child_process";
import { LocalizedError } from "./i18n";

/** Ouvre la fenêtre « Choisir un dossier » du Finder. Renvoie null si l'utilisateur annule. */
export function pickFolder(): Promise<string | null> {
  if (process.platform !== "darwin") {
    return Promise.reject(new LocalizedError("errPickFolderMac"));
  }
  const script = 'POSIX path of (choose folder with prompt "Choisis un dossier de polices")';
  return new Promise((resolve, reject) => {
    execFile("osascript", ["-e", script], { timeout: 5 * 60 * 1000 }, (error, stdout, stderr) => {
      if (error) {
        // -128 : l'utilisateur a cliqué sur « Annuler ».
        if (stderr.includes("-128")) return resolve(null);
        return reject(new Error(stderr.trim() || error.message));
      }
      const path = stdout.trim().replace(/\/$/, "");
      resolve(path || null);
    });
  });
}
