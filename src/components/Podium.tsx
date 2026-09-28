import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Crown,
  FileSpreadsheet,
  Flag,
  ImageDown,
  RotateCcw,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import type { Team } from "../types";
import { cn } from "../utils/cn";
import AnimatedScore from "./AnimatedScore";

const MEDAL_COLORS = ["#FFD34D", "#D7DBE4", "#E8A06A"] as const;
const PLACE_LABELS = ["1ST", "2ND", "3RD"] as const;

/* --------------------------------- actions ---------------------------------- */

function CeremonyAction({
  onClick,
  label,
  children,
  accent,
  wide,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  wide?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 font-mono text-[10px] font-bold tracking-[0.18em] transition-all duration-150 hover:-translate-y-px active:translate-y-0 active:scale-95",
        accent
          ? "border-volt/50 bg-volt/10 text-volt hover:bg-volt/20"
          : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
      {wide ?? <span className="hidden sm:inline">{label}</span>}
    </button>
  );
}

/* ------------------------------- podium column ------------------------------- */

function PodiumColumn({
  team,
  place,
  delay,
}: {
  team: Team;
  place: 1 | 2 | 3;
  delay: number;
}) {
  const medal = MEDAL_COLORS[place - 1];
  const stepH =
    place === 1
      ? "h-28 sm:h-36 md:h-44"
      : place === 2
        ? "h-20 sm:h-28 md:h-32"
        : "h-14 sm:h-20 md:h-24";
  const medalSize =
    place === 1
      ? "size-16 sm:size-20 md:size-24"
      : "size-14 sm:size-16 md:size-20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 90 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 28,
        delay,
      }}
      className="flex w-full max-w-[118px] flex-col items-center sm:max-w-[170px] md:max-w-[210px]"
    >
      {place === 1 && (
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, -4, 4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Crown size={24} style={{ color: medal }} className="mb-2" />
        </motion.div>
      )}

      {/* medal disc */}
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-display font-extrabold text-black",
          medalSize,
          place === 1 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
        )}
        style={{
          background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.85), ${medal} 48%, rgba(0,0,0,0.28) 135%), ${medal}`,
          boxShadow: `0 0 0 4px ${medal}33, 0 16px 44px -10px ${medal}80`,
        }}
      >
        {place}
      </div>

      {/* team */}
      <p
        className={cn(
          "mt-3 w-full truncate text-center font-semibold uppercase tracking-wide text-white/90",
          place === 1 ? "text-sm md:text-lg" : "text-xs md:text-base",
        )}
      >
        {team.name}
      </p>
      <p
        className="mt-1 flex items-baseline gap-1 font-mono font-bold tabular-nums"
        style={{ color: place === 1 ? team.color : "rgba(244,245,247,0.85)" }}
      >
        <AnimatedScore
          value={team.score}
          className={place === 1 ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}
        />
        <span className="text-[9px] uppercase tracking-[0.25em] text-white/30">
          PTS
        </span>
      </p>

      {/* step */}
      <div
        className={cn(
          "mt-4 flex w-full flex-col items-center rounded-t-2xl border-x border-t pt-3 md:pt-4",
          stepH,
        )}
        style={{
          background: `linear-gradient(to top, ${team.color}2e, ${team.color}0d)`,
          borderColor: `${team.color}40`,
        }}
      >
        <span
          className={cn(
            "font-display font-extrabold leading-none",
            place === 1 ? "text-2xl md:text-4xl" : "text-xl md:text-3xl",
          )}
          style={{ color: team.color }}
        >
          {PLACE_LABELS[place - 1]}
        </span>
        <span className="mt-1.5 font-mono text-[8px] uppercase tracking-[0.3em] text-white/35 md:text-[9px]">
          Place
        </span>
      </div>
    </motion.div>
  );
}

/* ---------------------------------- podium ---------------------------------- */

interface Props {
  teams: Team[];
  title: string;
  totalPoints: number;
  onClose: () => void;
  onPng: () => void;
  onCsv: () => void;
  onRematch: () => void;
}

export default function Podium({
  teams,
  title,
  totalPoints,
  onClose,
  onPng,
  onCsv,
  onRematch,
}: Props) {
  const [confirmRematch, setConfirmRematch] = useState(false);

  /* zero-score teams are unranked and never medal */
  const scored = teams.filter((t) => t.score > 0);
  const unranked = teams.filter((t) => t.score === 0);
  const top3 = scored.slice(0, 3);
  const rest = scored.slice(3);
  const winner = top3[0];

  /* celebration confetti on mount */
  useEffect(() => {
    const winnerColor = winner?.color ?? "#c8f542";
    const colors = ["#FFD34D", winnerColor, "#ffffff"];
    confetti({
      particleCount: 170,
      spread: 100,
      startVelocity: 46,
      origin: { y: 0.32 },
      colors,
      disableForReducedMotion: true,
    });
    const t1 = window.setTimeout(
      () =>
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.62 },
          colors,
          disableForReducedMotion: true,
        }),
      350,
    );
    const t2 = window.setTimeout(
      () =>
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.62 },
          colors,
          disableForReducedMotion: true,
        }),
      500,
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* esc + scroll lock */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    if (!confirmRematch) return;
    const t = window.setTimeout(() => setConfirmRematch(false), 2400);
    return () => window.clearTimeout(t);
  }, [confirmRematch]);

  const columns = [
    { team: top3[1] as Team | undefined, place: 2 as const, delay: 0.2 },
    { team: top3[0] as Team | undefined, place: 1 as const, delay: 0.5 },
    { team: top3[2] as Team | undefined, place: 3 as const, delay: 0.35 },
  ].filter((c): c is { team: Team; place: 1 | 2 | 3; delay: number } =>
    Boolean(c.team),
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-label="Final results"
      className="fixed inset-0 z-[90] overflow-y-auto bg-ink"
    >
      {/* backdrop */}
      <div className="pointer-events-none fixed inset-0">
        <img
          src="/images/arena.jpg"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/55 to-ink" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(85% 50% at 50% 0%, rgba(255,211,77,0.12), transparent 65%)",
          }}
        />
        <div className="noise absolute inset-0 opacity-[0.05]" />
      </div>

      {/* winner spotlight */}
      {winner && (
        <div
          className="pointer-events-none fixed left-1/2 top-40 h-80 w-[80vw] max-w-2xl -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${winner.color}1a` }}
        />
      )}

      <div className="relative flex min-h-full flex-col">
        {/* header */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 backdrop-blur-md md:h-[72px] md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-volt text-black">
              <Zap size={16} strokeWidth={2.5} />
            </span>
            <div className="hidden min-w-0 sm:block">
              <p className="flex items-center gap-1.5 truncate font-display text-xs font-bold tracking-wide md:text-sm">
                <Flag size={13} className="shrink-0 text-amber-300" />
                FINAL RESULTS
              </p>
              <p className="truncate font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
                {title.toUpperCase()} — competition ended
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <CeremonyAction onClick={onPng} label="PNG">
              <ImageDown size={13} />
            </CeremonyAction>
            <CeremonyAction onClick={onCsv} label="CSV">
              <FileSpreadsheet size={13} />
            </CeremonyAction>
            <CeremonyAction
              onClick={() => {
                if (confirmRematch) {
                  setConfirmRematch(false);
                  onRematch();
                } else {
                  setConfirmRematch(true);
                }
              }}
              label="REMATCH"
              wide={
                confirmRematch ? (
                  <span className="hidden text-rose-300 sm:inline">SURE?</span>
                ) : (
                  <span className="hidden sm:inline">REMATCH</span>
                )
              }
            >
              <RotateCcw
                size={13}
                className={cn(confirmRematch && "text-rose-300")}
              />
            </CeremonyAction>
            <CeremonyAction onClick={onClose} label="BACK" accent>
              <X size={13} />
            </CeremonyAction>
          </div>
        </div>

        {/* ceremony */}
        <div className="flex flex-1 flex-col items-center px-4 pb-14 pt-10 md:pt-14">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/40 md:text-[11px]">
            {String(teams.length).padStart(2, "0")} teams · {totalPoints} points
            played
          </p>
          <h2 className="mt-3 text-center font-display text-[clamp(2rem,7vw,4.5rem)] font-extrabold uppercase leading-none">
            <span className="text-outline">{title.toUpperCase()}</span>
          </h2>

          {winner ? (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, type: "spring", stiffness: 300, damping: 24 }}
              className="mt-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.3em] md:text-sm"
              style={{ color: winner.color }}
            >
              <Trophy size={15} />
              Champion — {winner.name}
            </motion.p>
          ) : (
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/35">
              {teams.length === 0
                ? "No teams competed in this session"
                : "No points scored — all teams unranked"}
            </p>
          )}

          {/* podium steps */}
          {columns.length > 0 && (
            <div className="mt-10 flex w-full max-w-4xl items-end justify-center gap-2 sm:gap-4 md:mt-14 md:gap-10">
              {columns.map(({ team, place, delay }) => (
                <PodiumColumn
                  key={team.id}
                  team={team}
                  place={place}
                  delay={delay}
                />
              ))}
            </div>
          )}

          {/* remaining places */}
          {rest.length > 0 && (
            <div className="mx-auto mt-12 w-full max-w-3xl">
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
                Full results
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {rest.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.04 }}
                    className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-2.5"
                  >
                    <span className="w-8 shrink-0 font-mono text-sm font-bold tabular-nums text-white/30">
                      {String(i + 4).padStart(2, "0")}
                    </span>
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-white/75">
                      {t.name}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
                      {t.score}
                      <span className="ml-1.5 text-[9px] uppercase tracking-[0.2em] text-white/30">
                        PTS
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* unranked teams */}
          {unranked.length > 0 && (
            <div className="mx-auto mt-8 w-full max-w-3xl">
              <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
                Unranked — no points
              </p>
              <div className="mt-3 flex flex-col gap-2">
                {unranked.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.04 }}
                    className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-2.5"
                  >
                    <span className="w-8 shrink-0 font-mono text-sm font-bold text-white/20">
                      —
                    </span>
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-white/50">
                      {t.name}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-bold tabular-nums text-white/40">
                      0
                      <span className="ml-1.5 text-[9px] uppercase tracking-[0.2em] text-white/25">
                        PTS
                      </span>
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
