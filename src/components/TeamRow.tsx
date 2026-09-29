import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  Minus,
  Pencil,
  Trash2,
} from "lucide-react";
import type { RankShift, ScoreDelta, Team } from "../types";
import { initialsOf } from "../types";
import { cn } from "../utils/cn";
import AnimatedScore from "./AnimatedScore";
import ScoreInput from "./ScoreInput";
import TieBadge from "./TieBadge";

const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

interface Props {
  team: Team;
  /** null = zero score, not ranked */
  rank: number | null;
  /** shares this rank with another team */
  tied?: boolean;
  isLeader: boolean;
  unranked?: boolean;
  topScore: number;
  delta?: ScoreDelta;
  shift?: RankShift;
  onAdd: (amount: number) => void;
  onRename: (name: string) => void;
  onRemove: () => void;
}

/* ------------------------------ tiny button atoms ----------------------------- */

export function StepChip({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label} points`}
      className="cursor-pointer rounded-lg border px-2.5 py-2 font-mono text-xs font-bold tabular-nums transition-all duration-150 hover:-translate-y-px active:translate-y-0 active:scale-90"
      style={
        color
          ? {
              borderColor: `${color}55`,
              background: `${color}14`,
              color,
            }
          : {
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(var(--fg-rgb), 0.85)",
            }
      }
    >
      {label}
    </button>
  );
}

export function MinusChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Subtract 1 point"
      className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-white/50 transition-all duration-150 hover:-translate-y-px hover:border-rose-400/40 hover:text-rose-300 active:translate-y-0 active:scale-90"
    >
      <Minus size={14} strokeWidth={2.5} />
    </button>
  );
}

/* --------------------------------- team row ---------------------------------- */

export default function TeamRow({
  team,
  rank,
  tied = false,
  isLeader,
  unranked = false,
  topScore,
  delta,
  shift,
  onAdd,
  onRename,
  onRemove,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(team.name);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!confirmingDelete) return;
    const t = window.setTimeout(() => setConfirmingDelete(false), 2200);
    return () => window.clearTimeout(t);
  }, [confirmingDelete]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const pct =
    team.score === 0
      ? 0
      : topScore > 0
        ? Math.max(3, Math.min(100, (team.score / topScore) * 100))
        : 0;
  const gap = topScore - team.score;

  const commitName = () => {
    setEditing(false);
    onRename(draft);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.22 } }}
      transition={SPRING}
      className={cn(
        "board-surface group relative overflow-hidden rounded-2xl border backdrop-blur-md transition-colors duration-300",
        isLeader
          ? "z-10 border-transparent"
          : unranked
            ? "z-0 border-dashed border-white/10 opacity-85"
            : "z-0 border-white/8",
      )}
      style={
        isLeader
          ? {
              backgroundImage: `linear-gradient(120deg, ${team.color}2e, rgba(255,255,255,0.04) 55%)`,
              boxShadow: `0 0 0 1px ${team.color}59, 0 24px 80px -30px ${team.color}66`,
            }
          : undefined
      }
    >
      {/* team color spine */}
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{
          background: `linear-gradient(to bottom, ${team.color}, ${team.color}1a)`,
        }}
      />

      {/* pace rail / progress to leader */}
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
          "relative flex flex-wrap items-center gap-x-4 gap-y-3 py-4 pl-6 pr-4 md:gap-x-5 md:pl-8 md:pr-5",
          isLeader && "py-5 md:py-6",
        )}
      >
        {/* rank — tie badge stands vertically beside the number */}
        <div className="flex shrink-0 items-center gap-1">
          {tied && rank !== null && (
            <TieBadge color={team.color} rank={rank} vertical />
          )}
          <div
            className={cn(
              "font-display font-bold tabular-nums leading-none",
              isLeader ? "text-[1.75rem] md:text-5xl" : "text-2xl md:text-4xl",
            )}
            style={{
              color: isLeader
                ? team.color
                : rank === null
                  ? "rgba(var(--fg-rgb), 0.18)"
                  : "rgba(var(--fg-rgb), 0.35)",
              textShadow: isLeader ? `0 0 30px ${team.color}66` : undefined,
            }}
          >
            {rank === null ? "—" : String(rank).padStart(2, "0")}
          </div>
        </div>

        {/* avatar */}
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold text-black/85 md:size-12 md:text-sm"
          style={{
            background: `linear-gradient(135deg, ${team.color}, ${team.color}a6)`,
            boxShadow: `0 10px 26px -12px ${team.color}80`,
          }}
        >
          {initialsOf(team.name)}
        </div>

        {/* name + meta */}
        <div className="min-w-0 flex-1 basis-40">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setDraft(team.name);
                    setEditing(false);
                  }
                }}
                maxLength={24}
                className="w-full min-w-0 max-w-xs border-b bg-transparent pb-0.5 text-base font-semibold uppercase tracking-wide text-white outline-none md:text-lg"
                style={{ borderColor: team.color }}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraft(team.name);
                  setEditing(true);
                }}
                className="cursor-text truncate text-left text-base font-semibold uppercase tracking-wide text-white/90 transition-colors hover:text-white md:text-lg"
                title="Rename team"
              >
                {team.name}
              </button>
            )}

            {isLeader && (
              <span
                className="inline-flex size-5 shrink-0 animate-glow-pulse items-center justify-center rounded-full"
                style={{ background: team.color }}
                title="Leader"
                aria-label="Leader"
              >
                <Crown size={11} strokeWidth={2.6} className="text-black" />
              </span>
            )}

            <AnimatePresence mode="wait">
              {shift && shift.places !== 0 && (
                <motion.span
                  key={shift.at}
                  initial={{ opacity: 0, scale: 0.6, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tabular-nums",
                    shift.places > 0
                      ? "bg-emerald-400/15 text-emerald-300"
                      : "bg-rose-400/15 text-rose-300",
                  )}
                >
                  {shift.places > 0 ? (
                    <ArrowUpRight size={11} strokeWidth={3} />
                  ) : (
                    <ArrowDownRight size={11} strokeWidth={3} />
                  )}
                  {Math.abs(shift.places)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
            {gap === 0 && team.score > 0 && tied
              ? "Tied for the lead"
              : isLeader
                ? "Setting the pace"
                : team.score === 0
                  ? "Waiting for first points"
                  : `Gap to lead −${gap} pts`}
          </p>
        </div>

        {/* score */}
        <div className="relative ml-auto flex items-baseline gap-2">
          <AnimatePresence>
            {delta && (
              <motion.span
                key={delta.at}
                initial={{ opacity: 0, y: 12, scale: 0.6, x: "-50%" }}
                animate={{ opacity: 1, y: -16, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: -32,
                  transition: { duration: 0.28, ease: "easeIn" },
                }}
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

        {/* controls */}
        <div className="order-last flex w-full items-center justify-end gap-1.5 md:order-none md:w-auto">
          <MinusChip onClick={() => onAdd(-1)} />
          <StepChip label="+1" onClick={() => onAdd(1)} />
          <StepChip label="+5" onClick={() => onAdd(5)} />
          <StepChip label="+10" onClick={() => onAdd(10)} color={team.color} />

          <ScoreInput color={team.color} onSubmit={onAdd} />

          <span className="mx-1 hidden h-6 w-px bg-white/10 md:block" />

          <button
            type="button"
            aria-label={`Rename ${team.name}`}
            onClick={() => {
              setDraft(team.name);
              setEditing(true);
            }}
            className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-2 text-white/40 transition-all duration-150 hover:-translate-y-px hover:text-white active:scale-90 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            aria-label={`Remove ${team.name}`}
            aria-live="polite"
            onClick={() => {
              if (confirmingDelete) {
                onRemove();
              } else {
                setConfirmingDelete(true);
              }
            }}
            className={cn(
              "cursor-pointer rounded-lg border p-2 font-mono text-[10px] font-bold tracking-[0.12em] transition-all duration-150 active:scale-90 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100",
              confirmingDelete
                ? "border-rose-400/70 bg-rose-400/20 px-2.5 text-rose-200"
                : "border-white/10 bg-white/5 text-white/40 hover:-translate-y-px hover:border-rose-400/40 hover:text-rose-300",
            )}
          >
            {confirmingDelete ? "SURE?" : <Trash2 size={14} />}
          </button>
        </div>
      </div>
    </motion.article>
  );
}
