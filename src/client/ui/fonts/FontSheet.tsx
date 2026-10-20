import type { JSX } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { FontFamily, FontRef } from "../../../shared/types";
import { allFamilies, config, fonts, fontsLoading } from "../../state/library";
import { Icon } from "../icons";
import { FontRow } from "./FontRow";

type SourceFilter = "all" | "local" | "google" | "favorites";

const SOURCES: readonly { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Tout" },
  { value: "local", label: "Mes polices" },
  { value: "google", label: "Google" },
  { value: "favorites", label: "Favoris" },
];
const CATEGORIES = ["Sans Serif", "Serif", "Display", "Handwriting", "Monospace"] as const;
const PAGE = 60;

interface FontSheetProps {
  title: string;
  value: FontRef | null;
  onPick: (family: FontFamily) => void;
  onClose: () => void;
}

function matches(family: FontFamily, source: SourceFilter, category: string | null, query: string): boolean {
  if (source === "local" && family.source !== "local") return false;
  if (source === "google" && family.source !== "google") return false;
  if (source === "favorites" && !config.value?.favorites.includes(family.key)) return false;
  if (category && family.category !== category) return false;
  return query === "" || family.family.toLowerCase().includes(query);
}

/** Feuille plein panneau pour choisir une police. */
export function FontSheet({ title, value, onPick, onClose }: FontSheetProps): JSX.Element {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>(fonts.value.local.length > 0 ? "local" : "all");
  const [category, setCategory] = useState<string | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const search = useRef<HTMLInputElement>(null);

  useEffect(() => search.current?.focus(), []);
  useEffect(() => setLimit(PAGE), [query, source, category]);

  const filtered = useMemo(
    () => allFamilies.value.filter((family) => matches(family, source, category, query.trim().toLowerCase())),
    [allFamilies.value, source, category, query, config.value?.favorites],
  );

  const onScroll = (event: Event): void => {
    const list = event.currentTarget as HTMLElement;
    if (list.scrollTop + list.clientHeight > list.scrollHeight - 200) setLimit((current) => current + PAGE);
  };

  return (
    <div class="sheet" onKeyDown={(event) => event.key === "Escape" && onClose()}>
      <div class="sheet-head">
        <button type="button" class="icon-btn" onClick={onClose} aria-label="Retour">
          <Icon name="back" />
        </button>
        <input
          ref={search}
          class="input grow"
          placeholder={`Police pour ${title.toLowerCase()}…`}
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
        />
      </div>
      <div class="stack" style="padding:8px 8px 4px">
        <div class="chip-row">
          {SOURCES.map((option) => (
            <button type="button" class="chip" key={option.value} aria-pressed={source === option.value} onClick={() => setSource(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
        {source !== "local" && (
          <div class="chip-row">
            {CATEGORIES.map((name) => (
              <button type="button" class="chip" key={name} aria-pressed={category === name} onClick={() => setCategory(category === name ? null : name)}>
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div class="font-list" onScroll={onScroll}>
        {fontsLoading.value && <p class="empty">Chargement des polices…</p>}
        {!fontsLoading.value && filtered.length === 0 && (
          <p class="empty">
            {source === "local" && fonts.value.local.length === 0
              ? "Aucune police locale. Ajoute un dossier dans les réglages (roue dentée)."
              : "Aucune police ne correspond."}
          </p>
        )}
        {filtered.slice(0, limit).map((family) => (
          <FontRow
            key={family.key}
            family={family}
            selected={value?.family === family.family && value.source === family.source}
            onPick={onPick}
          />
        ))}
      </div>
    </div>
  );
}
