/* ---------------------------------- accents --------------------------------- */

export interface Accent {
  id: string;
  name: string;
  color: string;
}

export const ACCENTS: Accent[] = [
  { id: "volt", name: "Volt", color: "#C8F542" },
  { id: "cyan", name: "Cyan", color: "#41D8FF" },
  { id: "magenta", name: "Magenta", color: "#FF5CC8" },
  { id: "amber", name: "Amber", color: "#FFB020" },
  { id: "mint", name: "Mint", color: "#3DFFB4" },
  { id: "violet", name: "Violet", color: "#A98BFF" },
  { id: "coral", name: "Coral", color: "#FF7A45" },
  { id: "ice", name: "Ice", color: "#E6EDF7" },
];

/* -------------------------------- backgrounds -------------------------------- */

export interface Background {
  id: string;
  name: string;
  /** image under public/, or null for pure CSS */
  image: string | null;
  /** css background applied beneath/instead of the image */
  css?: string;
  /** image opacity */
  opacity?: number;
  swatch: string;
}

export const BACKGROUNDS: Background[] = [
  {
    id: "arena",
    name: "Arena",
    image: "/images/arena.jpg",
    opacity: 0.45,
    swatch: "linear-gradient(135deg,#10140c,#2b3a16)",
  },
  {
    id: "nebula",
    name: "Nebula",
    image: "/images/bg-nebula.jpg",
    opacity: 0.5,
    swatch: "linear-gradient(135deg,#140f24,#2a1b4d)",
  },
  {
    id: "court",
    name: "Court",
    image: "/images/bg-court.jpg",
    opacity: 0.42,
    swatch: "linear-gradient(135deg,#1a1208,#4a2f12)",
  },
  {
    id: "mesh",
    name: "Mesh",
    image: null,
    css: "radial-gradient(60% 55% at 15% 12%, rgba(120,90,255,0.22), transparent 60%), radial-gradient(55% 50% at 85% 20%, rgba(0,190,255,0.16), transparent 62%), radial-gradient(70% 60% at 50% 100%, rgba(255,90,160,0.14), transparent 65%)",
    swatch: "linear-gradient(135deg,#2a1f5e,#0b2b46)",
  },
  {
    id: "grid",
    name: "Grid",
    image: null,
    css: "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
    swatch:
      "linear-gradient(135deg,#0d0f16,#0d0f16), repeating-linear-gradient(0deg,#222 0 1px,transparent 1px 7px)",
  },
  {
    id: "void",
    name: "Void",
    image: null,
    swatch: "linear-gradient(135deg,#06070b,#14161f)",
  },
];

/* --------------------------------- palettes ---------------------------------- */

export interface Palette {
  id: string;
  name: string;
  colors: string[];
}

export const PALETTES: Palette[] = [
  {
    id: "neon",
    name: "Neon",
    colors: [
      "#C8F542",
      "#41D8FF",
      "#FF7A45",
      "#D78BFF",
      "#FFB020",
      "#3DFFB4",
      "#FF5C8A",
      "#8A7CFF",
      "#6BE0FF",
      "#B7FF4A",
    ],
  },
  {
    id: "sunset",
    name: "Sunset",
    colors: [
      "#FF6B6B",
      "#FF9F45",
      "#FFD166",
      "#F786AA",
      "#FF5C8A",
      "#FFAE7B",
      "#E8615D",
      "#FFC7A1",
      "#D96BA0",
      "#FF8C42",
    ],
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: [
      "#41D8FF",
      "#3DFFB4",
      "#5AA9FF",
      "#7BE0D6",
      "#8A7CFF",
      "#2FE8C3",
      "#6BC5FF",
      "#A6F0E5",
      "#4F7DFF",
      "#39C9E8",
    ],
  },
  {
    id: "candy",
    name: "Candy",
    colors: [
      "#FF7AD5",
      "#A98BFF",
      "#7BE0FF",
      "#FFD166",
      "#8CF5B0",
      "#FF9BB3",
      "#C89BFF",
      "#95E8FF",
      "#FFE08A",
      "#FFA8E4",
    ],
  },
  {
    id: "earth",
    name: "Earth",
    colors: [
      "#D9A441",
      "#A8C256",
      "#E08A5D",
      "#8FB996",
      "#C9744F",
      "#BFD07A",
      "#E0B583",
      "#7FA88C",
      "#CE8E5F",
      "#9FBF6B",
    ],
  },
  {
    id: "mono",
    name: "Mono",
    colors: [
      "#F4F5F7",
      "#C9CFDA",
      "#A3ABBA",
      "#DDE3EC",
      "#8E97A8",
      "#B6BECD",
      "#EDF1F7",
      "#79828F",
      "#CED5E0",
      "#9AA3B2",
    ],
  },
];

export function accentById(id: string): Accent {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}
export function backgroundById(id: string): Background {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
export function paletteById(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/** hex -> "r, g, b" for rgba() composition */
export function hexToRgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}
