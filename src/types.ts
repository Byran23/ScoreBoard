export interface Team {
  id: string;
  name: string;
  color: string;
  score: number;
  createdAt: number;
}

export interface ScoreDelta {
  amount: number;
  at: number;
}

export interface RankShift {
  /** positive = moved up that many places, negative = dropped */
  places: number;
  at: number;
}

export interface LeadEvent {
  teamId: string;
  at: number;
}

export const PALETTE = [
  "#C8F542", // volt
  "#41D8FF", // cyan
  "#FF7A45", // coral
  "#D78BFF", // orchid
  "#FFB020", // amber
  "#3DFFB4", // mint
  "#FF5C8A", // rose
  "#8A7CFF", // periwinkle
  "#6BE0FF", // ice
  "#B7FF4A", // lime
];

export const MAX_TEAMS = 50;

export function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Curated colors for the first teams, golden-angle hues beyond that. Always hex. */
export function colorForIndex(index: number): string {
  if (index < PALETTE.length) return PALETTE[index];
  return hslToHex(Math.round((index * 137.508) % 360), 85, 64);
}
