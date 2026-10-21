import type { Config, FontsResponse, Language } from "../../shared/types";
import { describeError, LocalizedError } from "../i18n";
import { loadGoogleFonts } from "./google-library";
import type { FaceRecord } from "./read-font";
import { scanLocalFonts, type LocalScan } from "./local-library";

/** Garde en mémoire les polices trouvées, et sait retrouver le fichier d'une graisse. */
export class FontService {
  private scan: LocalScan | null = null;
  private scannedFolders = "";
  private pending: Promise<LocalScan> | null = null;

  private async local(folders: readonly string[], force: boolean): Promise<LocalScan> {
    const signature = folders.join("\n");
    if (!force && this.scan && signature === this.scannedFolders) return this.scan;
    if (!force && this.pending) return this.pending;
    this.pending = scanLocalFonts(folders);
    try {
      this.scan = await this.pending;
      this.scannedFolders = signature;
      return this.scan;
    } finally {
      this.pending = null;
    }
  }

  async list(config: Config, language: Language, force = false): Promise<FontsResponse> {
    const local = await this.local(config.fontFolders, force);
    const errors = local.errors.map((error) => describeError(error, language));
    let google: FontsResponse["google"] = [];
    if (config.googleFonts) {
      try {
        google = await loadGoogleFonts();
      } catch (error) {
        errors.push(describeError(new LocalizedError("googleUnavailable", { error: describeError(error, language) }), language));
      }
    }
    return { local: local.families, google, errors };
  }

  file(id: string): FaceRecord | null {
    return this.scan?.files.get(id) ?? null;
  }

  /** Tous les fichiers d'une famille locale (pour les copier dans le projet à la validation). */
  filesOf(family: string): FaceRecord[] {
    if (!this.scan) return [];
    const wanted = family.toLowerCase();
    return [...this.scan.files.values()].filter((face) => face.family.toLowerCase() === wanted);
  }
}
