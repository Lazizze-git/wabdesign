import type { JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { humanLabel } from "../engine/selector";
import { highlightSelector, hovered, inspecting, selected } from "../state/inspector";
import { getHost } from "../state/ui";

interface Box {
  key: string;
  rect: DOMRect;
  label: string | null;
  secondary: boolean;
}

const MAX_MATCHES = 60;

function matchesOf(selector: string | null): Element[] {
  if (!selector) return [];
  try {
    return Array.from(document.querySelectorAll(selector)).slice(0, MAX_MATCHES);
  } catch {
    return [];
  }
}

function measure(): Box[] {
  const host = getHost();
  const boxes: Box[] = [];
  const hover = inspecting.value ? hovered.value : null;
  if (hover?.isConnected && !host?.contains(hover)) {
    boxes.push({ key: "hover", rect: hover.getBoundingClientRect(), label: humanLabel(hover), secondary: false });
  }
  const current = selected.value;
  if (current?.isConnected && current !== hover) {
    boxes.push({ key: "selected", rect: current.getBoundingClientRect(), label: null, secondary: false });
  }
  matchesOf(highlightSelector.value).forEach((element, index) => {
    boxes.push({ key: `match-${index}`, rect: element.getBoundingClientRect(), label: null, secondary: true });
  });
  return boxes;
}

/** Cadres bleus dans la page : élément survolé, élément sélectionné, éléments visés par une modification. */
export function Highlights(): JSX.Element | null {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const active = inspecting.value || selected.value !== null || highlightSelector.value !== null;

  useEffect(() => {
    if (!active) {
      setBoxes([]);
      return undefined;
    }
    let frame = 0;
    let previous = "";
    const tick = (): void => {
      const next = measure();
      // On ne redessine que si un cadre a bougé (défilement, animation, redimensionnement).
      const signature = next.map((box) => `${box.key}${box.rect.x},${box.rect.y},${box.rect.width},${box.rect.height}${box.label ?? ""}`).join("|");
      if (signature !== previous) {
        previous = signature;
        setBoxes(next);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  if (boxes.length === 0) return null;
  return (
    <>
      {boxes.map((box) => (
        <div
          key={box.key}
          class={`highlight${box.secondary ? " secondary" : ""}`}
          style={{ left: `${box.rect.left}px`, top: `${box.rect.top}px`, width: `${box.rect.width}px`, height: `${box.rect.height}px` }}
        >
          {box.label && <span class="highlight-tag">{box.label}</span>}
        </div>
      ))}
    </>
  );
}
