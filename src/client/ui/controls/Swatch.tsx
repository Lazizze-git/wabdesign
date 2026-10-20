import type { JSX } from "preact";

/** Pastille de couleur (avec damier visible derrière les couleurs transparentes). */
export function Swatch({ color, large = false, armed = false }: { color: string; large?: boolean; armed?: boolean }): JSX.Element {
  const classes = ["swatch", large ? "lg" : "", armed ? "armed" : ""].filter(Boolean).join(" ");
  return (
    <span class={classes}>
      <span class="fill" style={{ background: color }} />
    </span>
  );
}
