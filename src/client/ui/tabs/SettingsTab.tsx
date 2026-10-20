import type { JSX } from "preact";
import { useState } from "preact/hooks";
import { api } from "../../api";
import { config, fonts, fontsLoading, loadFonts, status, updateConfig } from "../../state/library";
import { notify } from "../../state/toasts";
import { Icon } from "../icons";

function addFolder(path: string): void {
  const clean = path.trim().replace(/\/$/, "");
  if (!clean.startsWith("/")) {
    notify("Le chemin doit commencer par / (clic droit + Option dans le Finder → Copier en tant que nom de chemin)", "error");
    return;
  }
  void updateConfig((current) =>
    current.fontFolders.includes(clean) ? current : { ...current, fontFolders: [...current.fontFolders, clean] },
  );
}

function FoldersSection(): JSX.Element {
  const [manual, setManual] = useState("");
  const folders = config.value?.fontFolders ?? [];
  const drive = status.value?.driveRoot;

  const browse = async (): Promise<void> => {
    try {
      const picked = await api.pickFolder();
      if (picked.path) addFolder(picked.path);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Sélection impossible", "error");
    }
  };

  return (
    <section class="section stack">
      <div class="section-head" style="margin:0">
        <span class="section-title">Dossiers de polices</span>
        <button type="button" class="icon-btn" onClick={() => void loadFonts(true)} disabled={fontsLoading.value} title="Relire les dossiers" aria-label="Relire les dossiers">
          <Icon name="refresh" size={14} />
        </button>
      </div>
      <p class="hint" style="margin:0">
        Fichiers .otf, .ttf, .woff et .woff2, sous-dossiers compris. {fonts.value.local.length} famille(s) trouvée(s).
      </p>
      {folders.map((folder) => (
        <div class="row" key={folder}>
          <Icon name="folder" size={14} />
          <span class="grow truncate mono" title={folder}>
            {folder.replace(/^\/Users\/[^/]+/, "~")}
          </span>
          <button
            type="button"
            class="icon-btn sm"
            aria-label="Retirer ce dossier"
            onClick={() => void updateConfig((current) => ({ ...current, fontFolders: current.fontFolders.filter((f) => f !== folder) }))}
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}
      <button type="button" class="btn btn-block" onClick={() => void browse()}>
        <Icon name="folder" size={14} /> Choisir un dossier…
      </button>
      {drive && <p class="hint" style="margin:0">Google Drive est synchronisé sur ce Mac : choisis ton dossier dans « Google Drive » depuis la fenêtre du Finder.</p>}
      <form class="row" onSubmit={(event) => (event.preventDefault(), addFolder(manual), setManual(""))}>
        <input class="input grow mono" placeholder="ou colle un chemin : /Users/…" value={manual} onInput={(e) => setManual(e.currentTarget.value)} />
        <button type="submit" class="btn" disabled={!manual.trim()}>
          Ajouter
        </button>
      </form>
    </section>
  );
}

export function SettingsTab(): JSX.Element {
  const current = config.value;
  return (
    <>
      <FoldersSection />
      <section class="section stack">
        <label class="row">
          <input
            type="checkbox"
            checked={current?.googleFonts ?? true}
            onChange={(event) => void updateConfig((c) => ({ ...c, googleFonts: event.currentTarget.checked }))}
          />
          <span class="grow">Catalogue Google Fonts</span>
          <span class="muted">{fonts.value.google.length}</span>
        </label>
      </section>
      <section class="section stack">
        <span class="section-title">Raccourcis</span>
        <div class="row"><span class="grow">Afficher / cacher le panneau</span><span class="mono">⌥ D</span></div>
        <div class="row"><span class="grow">Annuler / rétablir</span><span class="mono">⌘ Z / ⇧ ⌘ Z</span></div>
        <div class="row"><span class="grow">Sélectionner un élément</span><span class="mono">⌥ S</span></div>
        <div class="row"><span class="grow">Voir l’original (maintenir)</span><span class="mono">⌥ A</span></div>
      </section>
      {status.value && (
        <section class="section">
          <p class="hint mono" style="margin:0">
            Projet : {status.value.project.replace(/^\/Users\/[^/]+/, "~")}
            <br />
            Preview : {status.value.target}
          </p>
        </section>
      )}
    </>
  );
}
