import { Equal } from "lucide-react";
import { cn } from "../utils/cn";

/**
 * Pill shown on teams that share a rank with someone else.
 * Uses the team color so it reads as part of that row.
 *
 * `vertical` rotates the pill 90° so it can sit alongside the rank number
 * without stealing horizontal space.
 */
export default function TieBadge({
  color,
  rank,
  large = false,
  compact = false,
  vertical = false,
  className,
}: {
  color: string;
  rank: number;
  large?: boolean;
  compact?: boolean;
  vertical?: boolean;
  className?: string;
}) {
  const pill = (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1 rounded-full border font-mono font-bold uppercase leading-none",
        vertical
          ? "px-2 py-[3px] text-[8px] tracking-[0.18em]"
          : compact
            ? "px-1.5 py-[3px] text-[8px] tracking-[0.12em]"
            : large
              ? "px-2 py-0.5 text-[10px] tracking-[0.16em]"
              : "px-1.5 py-0.5 text-[9px] tracking-[0.16em]",
        !vertical && className,
      )}
      style={{
        color,
        borderColor: `${color}59`,
        background: `${color}1a`,
      }}
      title={`Tied for rank ${rank}`}
      aria-label={`Tied for rank ${rank}`}
    >
      {!compact && !vertical && <Equal size={large ? 11 : 9} strokeWidth={3} />}
      TIED
    </span>
  );

  if (!vertical) return pill;

  /* rotate in place: the wrapper reserves only the rotated footprint */
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center",
        large ? "w-6" : "w-5",
        className,
      )}
    >
      <span className="-rotate-90">{pill}</span>
    </span>
  );
}
