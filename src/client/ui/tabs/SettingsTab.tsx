import type { JSX } from "preact";
import { useState } from "preact/hooks";
import type { LanguageSetting } from "../../../shared/types";
import { api } from "../../api";
import { languageSetting, t, tn } from "../../i18n";
import { config, fonts, fontsLoading, loadFonts, status, updateConfig } from "../../state/library";
import { notify } from "../../state/toasts";
import { welcomeRequested } from "../../state/ui";
import { Segmented } from "../controls/Segmented";
import { Icon } from "../icons";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function addFolder(path: string): void {
  const clean = path.trim().replace(/\/$/, "");
  if (!clean.startsWith("/") && !/^[A-Za-z]:\\/.test(clean)) {
    notify(t("settings.badPath"), "error");
    return;
  }
  void updateConfig((current) =>
    current.fontFolders.includes(clean) ? current : { ...current, fontFolders: [...current.fontFolders, clean] },
  );
}

function shortPath(path: string): string {
  return path.replace(/^\/Users\/[^/]+/, "~");
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
      notify(error instanceof Error ? error.message : t("settings.pickFailed"), "error");
    }
  };

  return (
    <section class="section stack">
      <div class="section-head" style="margin:0">
        <span class="section-title">{t("settings.folders")}</span>
        <button type="button" class="icon-btn" onClick={() => void loadFonts(true)} disabled={fontsLoading.value} title={t("settings.rescan")} aria-label={t("settings.rescan")}>
          <Icon name="refresh" size={14} />
        </button>
      </div>
      <p class="hint" style="margin:0">
        {tn(fonts.value.local.length, "settings.foldersHint.one", "settings.foldersHint.other")}
      </p>
      {folders.map((folder) => (
        <div class="row" key={folder}>
          <Icon name="folder" size={14} />
          <span class="grow truncate mono" title={folder}>
            {shortPath(folder)}
          </span>
          <button
            type="button"
            class="icon-btn sm"
            aria-label={t("settings.removeFolder")}
            onClick={() => void updateConfig((current) => ({ ...current, fontFolders: current.fontFolders.filter((f) => f !== folder) }))}
          >
            <Icon name="close" size={13} />
          </button>
        </div>
      ))}
      <button type="button" class="btn btn-block" onClick={() => void browse()}>
        <Icon name="folder" size={14} /> {t("settings.chooseFolder")}
      </button>
      {drive && <p class="hint" style="margin:0">{t("settings.drive")}</p>}
      <form class="row" onSubmit={(event) => (event.preventDefault(), addFolder(manual), setManual(""))}>
        <input class="input grow mono" placeholder={t("settings.pastePath")} value={manual} onInput={(e) => setManual(e.currentTarget.value)} />
        <button type="submit" class="btn" disabled={!manual.trim()}>
          {t("common.add")}
        </button>
      </form>
    </section>
  );
}

function LanguageSection(): JSX.Element {
  const choose = (value: LanguageSetting): void => {
    languageSetting.value = value;
    void updateConfig((current) => ({ ...current, language: value }));
  };
  return (
    <section class="section stack">
      <span class="section-title">{t("settings.language")}</span>
      <Segmented<LanguageSetting>
        label={t("settings.language")}
        options={[
          { value: "auto", label: t("settings.languageAuto") },
          { value: "fr", label: "Français" },
          { value: "en", label: "English" },
        ]}
        value={languageSetting.value}
        onChange={choose}
      />
    </section>
  );
}

function ShortcutsSection(): JSX.Element {
  const alt = IS_MAC ? "⌥ " : "Alt + ";
  const rows: [string, string][] = [
    [t("settings.toggle"), `${alt}D`],
    [t("settings.undoRedo"), IS_MAC ? "⌘ Z / ⇧ ⌘ Z" : "Ctrl + Z / Ctrl + Shift + Z"],
    [t("settings.pick"), `${alt}S`],
    [t("settings.deselect"), IS_MAC ? "esc" : "Esc"],
    [t("settings.original"), `${alt}A`],
  ];
  return (
    <section class="section stack">
      <span class="section-title">{t("settings.shortcuts")}</span>
      {rows.map(([label, keys]) => (
        <div class="row" key={label}>
          <span class="grow">{label}</span>
          <span class="mono">{keys}</span>
        </div>
      ))}
    </section>
  );
}

export function SettingsTab(): JSX.Element {
  const current = config.value;
  return (
    <>
      <LanguageSection />
      <FoldersSection />
      <section class="section stack">
        <label class="row">
          <input
            type="checkbox"
            checked={current?.googleFonts ?? true}
            onChange={(event) => void updateConfig((c) => ({ ...c, googleFonts: event.currentTarget.checked }))}
          />
          <span class="grow">{t("settings.google")}</span>
          <span class="muted">{fonts.value.google.length}</span>
        </label>
      </section>
      <ShortcutsSection />
      <section class="section">
        <button type="button" class="btn btn-block" onClick={() => (welcomeRequested.value = true)}>
          {t("welcome.again")}
        </button>
      </section>
      {status.value && (
        <section class="section">
          <p class="hint mono" style="margin:0">
            {t("settings.project", { path: shortPath(status.value.project) })}
            <br />
            {t("settings.preview", { url: status.value.target })}
          </p>
        </section>
      )}
    </>
  );
}
