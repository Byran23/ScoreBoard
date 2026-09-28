import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import {
  Crown,
  FileSpreadsheet,
  ImageDown,
  Minimize2,
  Search,
  SearchX,
  X,
  Zap,
} from "lucide-react";
import type { ScoreDelta, Team } from "../types";
import { initialsOf } from "../types";
import { cn } from "../utils/cn";
import AnimatedScore from "./AnimatedScore";
import { MinusChip, StepChip } from "./TeamRow";

const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

/* -------------------------------- present row -------------------------------- */

function PresentRow({
  team,
  rank,
  isLeader,
  topScore,
  delta,
  onAdd,
}: {
  team: Team;
  rank: number;
  isLeader: boolean;
  topScore: number;
  delta?: ScoreDelta;
  onAdd: (amount: number) => void;
}) {
  const pct =
    topScore > 0 ? Math.max(3, Math.min(100, (team.score / topScore) * 100)) : 0;
  const gap = topScore - team.score;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      transition={SPRING}
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-md",
        isLeader
          ? "z-10 border-transparent"
          : "z-0 border-white/8 bg-white/[0.03]",
      )}
      style={
        isLeader
          ? {
              background: `linear-gradient(120deg, ${team.color}1a, rgba(255,255,255,0.04) 55%)`,
              boxShadow: `0 0 0 1px ${team.color}59, 0 24px 80px -30px ${team.color}66`,
            }
          : undefined
      }
    >
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{
          background: `linear-gradient(to bottom, ${team.color}, ${team.color}1a)`,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white/5">
        <div
          className="h-full rounded-r-full transition-[width] duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${team.color}4d, ${team.color})`,
            boxShadow: `0 0 14px ${team.color}59`,
          }}
        />
      </div>

      <div
        className={cn(
          "relative flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 md:gap-x-6 md:px-8",
          isLeader && "py-5 md:py-6",
        )}
      >
        <div
          className={cn(
            "shrink-0 font-display font-bold tabular-nums leading-none",
            isLeader ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl",
          )}
          style={{
            color: isLeader ? team.color : "rgba(244,245,247,0.3)",
            textShadow: isLeader ? `0 0 30px ${team.color}66` : undefined,
          }}
        >
          {String(rank).padStart(2, "0")}
        </div>

        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold text-black/85 md:size-12 md:text-sm"
          style={{
            background: `linear-gradient(135deg, ${team.color}, ${team.color}a6)`,
            boxShadow: `0 10px 26px -12px ${team.color}80`,
          }}
        >
          {initialsOf(team.name)}
        </div>

        <div className="min-w-0 flex-1 basis-36">
          <div className="flex items-center gap-2">
            <p className="truncate text-base font-semibold uppercase tracking-wide text-white/90 md:text-xl">
              {team.name}
            </p>
            {isLeader && (
              <span
                className="inline-flex animate-glow-pulse items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.18em] text-black"
                style={{ background: team.color }}
              >
                <Crown size={10} strokeWidth={2.5} />
                LEADER
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
            {isLeader
              ? "Setting the pace"
              : gap === 0 && team.score > 0
                ? "Level at the top"
                : team.score === 0
                  ? "Waiting for first points"
                  : `Gap to lead −${gap} pts`}
          </p>
        </div>

        <div className="relative ml-auto flex shrink-0 items-baseline gap-2 md:ml-0">
          <AnimatePresence>
            {delta && (
              <motion.span
                key={delta.at}
                initial={{ opacity: 0, y: 12, scale: 0.6, x: "-50%" }}
                animate={{ opacity: 1, y: -16, scale: 1 }}
                exit={{ opacity: 0, y: -32, transition: { duration: 0.28 } }}
                transition={{ type: "spring", stiffness: 520, damping: 26 }}
                className="pointer-events-none absolute -top-2 left-[38%] font-mono text-sm font-bold tabular-nums"
                style={{ color: delta.amount >= 0 ? team.color : "#ff8ab0" }}
              >
                {delta.amount >= 0 ? `+${delta.amount}` : delta.amount}
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatedScore
            value={team.score}
            className={cn(
              "tabular-nums font-mono font-bold leading-none",
              isLeader ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
            )}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
            PTS
          </span>
        </div>

        {/* live scoring controls */}
        <div className="flex items-center justify-end gap-1.5 max-md:order-last max-md:w-full">
          <MinusChip onClick={() => onAdd(-1)} />
          <StepChip label="+1" onClick={() => onAdd(1)} />
          <StepChip label="+5" onClick={() => onAdd(5)} />
          <StepChip label="+10" onClick={() => onAdd(10)} color={team.color} />
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------- max view ---------------------------------- */

interface Props {
  teams: Team[];
  totalPoints: number;
  topScore: number;
  deltas: Record<string, ScoreDelta>;
  onClose: () => void;
  onPng: () => void;
  onCsv: () => void;
  onAdd: (teamId: string, amount: number) => void;
}

function MaxAction({
  onClick,
  label,
  children,
  accent,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  accent?: boolean;
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
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

export default function MaxView({
  teams,
  totalPoints,
  topScore,
  deltas,
  onClose,
  onPng,
  onCsv,
  onAdd,
}: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const rows = teams
    .map((team, i) => ({ team, rank: i + 1 }))
    .filter(({ team }) => !q || team.name.toLowerCase().includes(q));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-label="Leaderboard — presentation mode"
      className="fixed inset-0 z-[80] bg-ink"
    >
      {/* backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src="/images/arena.jpg"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/50 to-ink" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(85% 45% at 50% -6%, rgba(200,245,66,0.13), transparent 65%)",
          }}
        />
        <div className="noise absolute inset-0 opacity-[0.05]" />
      </div>

      <div className="relative flex h-full flex-col">
        {/* top bar */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4 backdrop-blur-md md:h-[72px] md:px-8">
          <div className="flex min-w-0 shrink-0 items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-volt text-black">
              <Zap size={16} strokeWidth={2.5} />
            </span>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate font-display text-xs font-bold tracking-wide md:text-sm">
                LIVE STANDINGS
              </p>
              <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-white/40">
                <span className="size-1.5 animate-pulse rounded-full bg-volt" />
                {String(teams.length).padStart(2, "0")} teams · {totalPoints}{" "}
                pts
              </p>
            </div>
          </div>

          {/* search */}
          <div className="relative mx-auto w-full max-w-xs min-w-0 flex-1 sm:max-w-md md:max-w-lg">
            <Search
              size={13}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team"
              aria-label="Search team"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-9 pr-8 font-mono text-[11px] uppercase tracking-[0.15em] text-white outline-none transition-colors placeholder:text-white/25 focus:border-volt/40 focus:bg-white/[0.07] md:py-2.5"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-white/40 transition-colors hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <MaxAction onClick={onPng} label="PNG">
              <ImageDown size={13} />
            </MaxAction>
            <MaxAction onClick={onCsv} label="CSV">
              <FileSpreadsheet size={13} />
            </MaxAction>
            <MaxAction onClick={onClose} label="EXIT" accent>
              <Minimize2 size={13} />
            </MaxAction>
          </div>
        </div>

        {/* board */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-6 md:px-8 md:py-10">
            <AnimatePresence initial={false}>
              {rows.map(({ team, rank }) => (
                <PresentRow
                  key={team.id}
                  team={team}
                  rank={rank}
                  isLeader={rank === 1 && team.score > 0}
                  topScore={topScore}
                  delta={deltas[team.id]}
                  onAdd={(amount) => onAdd(team.id, amount)}
                />
              ))}
            </AnimatePresence>

            {teams.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/15 py-16 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
                No teams on the board
              </div>
            )}

            {teams.length > 0 && rows.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/15 py-16 text-center">
                <SearchX size={20} className="text-white/30" />
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/30">
                  No teams match “{query.trim()}”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
