import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { FontFamily } from "../../../shared/types";
import { loadPreview } from "../../engine/font-loader";
import { isFavorite, toggleFavorite } from "../../state/library";
import { Icon } from "../icons";

interface FontRowProps {
  family: FontFamily;
  selected: boolean;
  onPick: (family: FontFamily) => void;
}

/** Une ligne de la liste : le nom écrit dans sa propre police, chargée seulement quand elle devient visible. */
export function FontRow({ family, selected, onPick }: FontRowProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadPreview(family);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [family.key]);

  const favorite = isFavorite(family);
  const variable = family.faces.some((face) => face.weightRange !== null);
  const detail = variable ? "Variable" : `${family.faces.length} style${family.faces.length > 1 ? "s" : ""}`;

  return (
    <div ref={ref} class="row">
      <button type="button" class="font-row" aria-selected={selected} onClick={() => onPick(family)}>
        <span class="font-name" style={{ fontFamily: `"${family.family}", system-ui` }}>
          {family.family}
        </span>
        <span class="tag">{family.source === "local" ? family.origin : detail}</span>
      </button>
      <button
        type="button"
        class="icon-btn sm star"
        aria-pressed={favorite}
        aria-label={favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        onClick={() => toggleFavorite(family)}
      >
        <Icon name="star" size={14} />
      </button>
    </div>
  );
}
