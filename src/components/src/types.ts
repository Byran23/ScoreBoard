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

export interface RankedTeam {
  team: Team;
  /** null = zero score, unranked. Ties share the same rank (1-2-2-4). */
  rank: number | null;
  /** true when another team shares this rank */
  tied: boolean;
}

/**
 * Standard competition ranking: equal scores share a rank and the
 * following rank skips accordingly (1, 2, 2, 4 …). Zero-score teams
 * are never ranked.
 */
export function rankTeams(sorted: Team[]): RankedTeam[] {
  const scored = sorted.filter((t) => t.score > 0);

  const rankByScore = new Map<number, number>();
  const countByScore = new Map<number, number>();
  scored.forEach((t, i) => {
    if (!rankByScore.has(t.score)) rankByScore.set(t.score, i + 1);
    countByScore.set(t.score, (countByScore.get(t.score) ?? 0) + 1);
  });

  return sorted.map((team) => {
    if (team.score <= 0) return { team, rank: null, tied: false };
    return {
      team,
      rank: rankByScore.get(team.score) ?? null,
      tied: (countByScore.get(team.score) ?? 0) > 1,
    };
  });
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
export function colorForIndex(index: number, palette: string[] = PALETTE): string {
  const list = palette.length ? palette : PALETTE;
  if (index < list.length) return list[index];
  return hslToHex(Math.round((index * 137.508) % 360), 85, 64);
}
