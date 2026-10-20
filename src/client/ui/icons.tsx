import type { JSX } from "preact";

/** Pictogrammes au trait, 16 px, dessinés à la main pour rester légers. */
const PATHS = {
  undo: "M4 7h7a3.5 3.5 0 0 1 0 7H8M4 7l3-3M4 7l3 3",
  redo: "M12 7H5a3.5 3.5 0 0 0 0 7h3M12 7 9 4m3 3-3 3",
  eye: "M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Zm6.5 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  settings: "M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm5.2-2a5 5 0 0 0-.1-1l1.4-1.1-1.5-2.6-1.7.6a5 5 0 0 0-1.7-1L9.3 1.2H6.7L6.4 2.9a5 5 0 0 0-1.7 1L3 3.3 1.5 5.9 2.9 7a5 5 0 0 0 0 2l-1.4 1.1L3 12.7l1.7-.6a5 5 0 0 0 1.7 1l.3 1.7h2.6l.3-1.7a5 5 0 0 0 1.7-1l1.7.6 1.5-2.6L13.1 9a5 5 0 0 0 .1-1Z",
  minimize: "M3.5 8h9",
  close: "m4 4 8 8m0-8-8 8",
  cursor: "m3 2.5 10 4.2-4.3 1.5-1.5 4.3L3 2.5Z",
  star: "m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.8Z",
  plus: "M8 3v10M3 8h10",
  trash: "M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5",
  refresh: "M13 8a5 5 0 1 1-1.5-3.6M13 2.5v3h-3",
  up: "M8 13V3M4 7l4-4 4 4",
  shuffle: "M2 4.5h2.5c3 0 4 7 7 7H14m0 0-2-2m2 2-2 2M2 11.5h2.5c1.2 0 2-1 2.6-2.3M14 4.5h-2.5c-1.2 0-2 1-2.6 2.3M14 4.5l-2-2m2 2-2 2",
  check: "m3 8.5 3 3 7-7",
  back: "M10 3 5 8l5 5",
  folder: "M2 4.5c0-.6.4-1 1-1h3.2l1.5 1.5H13c.6 0 1 .4 1 1V12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V4.5Z",
  link: "M7 9a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.6.6M9 7a3 3 0 0 0-4.2 0l-2 2A3 3 0 0 0 7 13.2l.6-.6",
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 16 }: { name: IconName; size?: number }): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
