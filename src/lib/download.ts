import type { Team } from "../types";
import { initialsOf, rankTeams } from "../types";

/* --------------------------------- helpers ---------------------------------- */

export function fileStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(
    d.getHours(),
  )}-${p(d.getMinutes())}`;
}

/** Fire-and-forget anchor download. Silently no-ops if the browser blocks it. */
export function triggerDownload(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    /* download blocked — the export sheet offers fallbacks */
  }
}

/* ----------------------------------- CSV ------------------------------------ */

export function makeCsvText(teams: Team[]): string {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const rows = [
    "Rank,Team,Points,Tied",
    ...rankTeams(sorted).map(
      ({ team, rank, tied }) =>
        `${rank ?? "NR"},"${team.name.replace(/"/g, '""')}",${team.score},${
          tied ? "YES" : "NO"
        }`,
    ),
  ];
  return rows.join("\n");
}

/* ------------------------------ PNG standings card --------------------------- */

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function renderStandingsPng(
  input: Team[],
  title = "STANDINGS",
  kicker = "LIVE",
): Promise<Blob | null> {
  const teams = [...input].sort((a, b) => b.score - a.score);

  try {
    await Promise.allSettled([
      document.fonts.load('800 60px "Unbounded"'),
      document.fonts.load('700 28px "Unbounded"'),
      document.fonts.load('700 32px "JetBrains Mono"'),
      document.fonts.load('700 18px "JetBrains Mono"'),
      document.fonts.load('600 25px "Space Grotesk"'),
      document.fonts.ready,
    ]);
  } catch {
    /* fonts unavailable — fall back to system fonts */
  }

  const W = 1240;
  const PADX = 72;
  const ROW_H = 84;
  const GAP = 14;
  const HEADER_BLOCK = 292;
  const FOOTER_BLOCK = 136;
  const H = HEADER_BLOCK + teams.length * (ROW_H + GAP) + FOOTER_BLOCK;

  const dpr = H > 4200 ? 1 : 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  const volt = "#c8f542";
  const white = "#f4f5f7";
  const dim = (a: number) => `rgba(244,245,247,${a})`;
  const display = (w: number, s: number) => `${w} ${s}px "Unbounded", sans-serif`;
  const mono = (w: number, s: number) => `${w} ${s}px "JetBrains Mono", monospace`;
  const sans = (w: number, s: number) => `${w} ${s}px "Space Grotesk", sans-serif`;

  /* backdrop */
  ctx.fillStyle = "#06070b";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, -80, 40, W / 2, -80, 760);
  glow.addColorStop(0, "rgba(200,245,66,0.17)");
  glow.addColorStop(1, "rgba(200,245,66,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  /* frame */
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1.5;
  rr(ctx, 24, 24, W - 48, H - 48, 28);
  ctx.stroke();

  let y = 88;

  /* wordmark + date */
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.font = mono(700, 18);
  ctx.fillStyle = volt;
  ctx.fillText("TALLY/BOARD", PADX, y);
  ctx.textAlign = "right";
  ctx.fillStyle = dim(0.45);
  const date = new Date()
    .toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    .toUpperCase();
  ctx.fillText(date, W - PADX, y);
  y += 78;

  /* headline — kicker + competition title, auto-shrunk to fit */
  const headlineKicker = kicker.toUpperCase();
  const headlineTitle = title.toUpperCase();
  let headSize = 60;
  ctx.font = display(800, headSize);
  const maxHeadW = W - 2 * PADX;
  while (
    ctx.measureText(`${headlineKicker} ${headlineTitle}`).width > maxHeadW &&
    headSize > 26
  ) {
    headSize -= 4;
    ctx.font = display(800, headSize);
  }
  ctx.textAlign = "left";
  ctx.fillStyle = volt;
  ctx.fillText(headlineKicker, PADX, y);
  const kickW = ctx.measureText(`${headlineKicker} `).width;
  ctx.fillStyle = white;
  ctx.fillText(headlineTitle, PADX + kickW, y);
  y += 64;

  /* stat line */
  const total = teams.reduce((s, t) => s + t.score, 0);
  ctx.font = mono(600, 20);
  ctx.fillStyle = dim(0.5);
  ctx.fillText(
    `${String(teams.length).padStart(2, "0")} TEAMS  ·  ${total} POINTS IN PLAY  ·  OFFICIAL RESULTS`,
    PADX,
    y,
  );
  y += 34;

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADX, y);
  ctx.lineTo(W - PADX, y);
  ctx.stroke();
  y += 28;

  /* rows — ties share a rank */
  const leaderScore = teams[0]?.score ?? 0;
  const rankedRows = rankTeams(teams);

  rankedRows.forEach(({ team: t, rank, tied }, i) => {
    const rowY = y + i * (ROW_H + GAP);
    const isLeader = rank === 1;
    const rowW = W - 2 * PADX;

    rr(ctx, PADX, rowY, rowW, ROW_H, 20);
    ctx.fillStyle = isLeader ? `${t.color}14` : "rgba(255,255,255,0.035)";
    ctx.fill();
    if (isLeader) {
      ctx.strokeStyle = `${t.color}66`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* color spine */
    ctx.fillStyle = t.color;
    ctx.fillRect(PADX, rowY, 5, ROW_H);

    /* rank — zero score teams are unranked */
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = display(700, 28);
    ctx.fillStyle = isLeader ? t.color : rank === null ? dim(0.15) : dim(0.3);
    ctx.fillText(
      rank === null
        ? "—"
        : `${tied ? "T" : ""}${String(rank).padStart(2, "0")}`,
      PADX + 30,
      rowY + ROW_H / 2 - 1,
    );

    /* initials chip */
    const chipX = PADX + 112;
    const chipS = 48;
    ctx.fillStyle = t.color;
    rr(ctx, chipX, rowY + ROW_H / 2 - chipS / 2, chipS, chipS, 13);
    ctx.fill();
    ctx.font = display(700, 16);
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.textAlign = "center";
    ctx.fillText(initialsOf(t.name), chipX + chipS / 2, rowY + ROW_H / 2 + 2);

    /* name */
    ctx.font = sans(600, 25);
    ctx.fillStyle = dim(0.95);
    ctx.textAlign = "left";
    const name = t.name.toUpperCase();
    ctx.fillText(name, chipX + chipS + 22, rowY + ROW_H / 2 + 2);

    /* score */
    ctx.font = mono(700, 32);
    ctx.textAlign = "right";
    ctx.fillStyle = white;
    ctx.fillText(String(t.score), W - PADX - 72, rowY + ROW_H / 2 - 1);
    ctx.font = mono(700, 14);
    ctx.fillStyle = dim(0.35);
    ctx.fillText("PTS", W - PADX - 30, rowY + ROW_H / 2 + 2);

    /* pace bar — none for unranked teams */
    const pct =
      t.score === 0
        ? 0
        : leaderScore > 0
          ? Math.max(0.03, t.score / leaderScore)
          : 0;
    if (pct > 0) {
      ctx.fillStyle = `${t.color}cc`;
      rr(ctx, PADX + 24, rowY + ROW_H - 12, (rowW - 48) * pct, 4, 2);
      ctx.fill();
    }
  });

  /* footer */
  const fy = y + teams.length * (ROW_H + GAP) + 24;
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.moveTo(PADX, fy);
  ctx.lineTo(W - PADX, fy);
  ctx.stroke();
  ctx.font = mono(600, 15);
  ctx.textAlign = "center";
  ctx.fillStyle = dim(0.3);
  ctx.fillText("TALLY/BOARD — LIVE SCORE STANDINGS", W / 2, fy + 42);

  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
}
