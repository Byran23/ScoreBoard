import { useMemo, useState } from "react";
import { CornerDownLeft, UserPlus } from "lucide-react";
import { MAX_TEAMS, colorForIndex } from "../types";

const SUGGESTIONS = [
  "Midnight Wolves",
  "Echo Strike",
  "Polar Express",
  "Basement Giants",
  "Orbit Kings",
  "Paper Rockets",
  "Static Bloom",
  "Turbo Pigeons",
  "Citrus Theory",
  "Ghost Frequency",
  "Velvet Hammer",
  "Brass Monkeys",
];

interface Props {
  teamCount: number;
  onAdd: (name: string) => boolean;
}

export default function AddTeam({ teamCount, onAdd }: Props) {
  const [name, setName] = useState("");
  const suggestion = useMemo(
    () => SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)],
    [],
  );
  const full = teamCount >= MAX_TEAMS;
  const nextColor = colorForIndex(teamCount);

  const submit = () => {
    if (full) return;
    if (onAdd(name.trim() ? name : suggestion)) setName("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 transition-colors focus-within:border-white/30 hover:bg-white/[0.035] md:px-5"
    >
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-dashed"
        style={{
          color: nextColor,
          borderColor: `${nextColor}66`,
          background: `${nextColor}0d`,
        }}
      >
        <UserPlus size={16} />
      </div>

      <input
        value={name}
        disabled={full}
        onChange={(e) => setName(e.target.value)}
        maxLength={24}
        placeholder={
          full
            ? `Roster full — ${MAX_TEAMS} teams max`
            : `New squad name — e.g. ${suggestion}`
        }
        className="min-w-0 flex-1 bg-transparent text-sm font-medium uppercase tracking-wide text-white outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-white/25"
      />

      <span className="hidden shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/25 sm:flex">
        <CornerDownLeft size={11} />
        {String(teamCount).padStart(2, "0")}
      </span>

      <button
        type="submit"
        disabled={full}
        className="shrink-0 cursor-pointer rounded-lg px-4 py-2 font-mono text-[11px] font-bold tracking-[0.15em] text-black transition-all duration-150 hover:-translate-y-px active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        style={{ background: nextColor, boxShadow: `0 10px 24px -10px ${nextColor}80` }}
      >
        ADD TEAM
      </button>
    </form>
  );
}
